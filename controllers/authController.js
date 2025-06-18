const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const mongoose = require('mongoose');
const { sendSMS } = require("../services/sendSMS");
const { sendOTP } = require("../services/emailService");
const { generateOTP } = require("../services/otpService");
const { cloudinary } = require('../config/cloudinaryConfig');

const tempUserStore = new Map();
const otpCache = new Map();

const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.googleLogin = async (req, res) => {
    try {
        const { tokenId } = req.body;
        
        // Verify Google token
        const ticket = await client.verifyIdToken({
            idToken: tokenId,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const { email_verified, email, name, picture } = ticket.getPayload();

        if (!email_verified) {
            return res.status(400).json({
                success: false,
                message: 'Email not verified with Google'
            });
        }

        // Check if user exists
        let user = await User.findOne({ email });

        if (!user) {
            // Create new user if doesn't exist
            user = new User({
                username: name,
                email: email,
                avatar: {
                    url: picture,
                    public_id: 'google_avatar'
                },
                password: email + process.env.JWT_SECRET, // Generate random password
                isVerified: true
            });

            await user.save();
        }

        // Generate JWT token
        const payload = {
            user: {
                id: user.id,
                email: user.email,
                user_role: user.user_role
            }
        };

        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(200).json({
            success: true,
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                avatar: user.avatar,
                user_role: user.user_role
            }
        });

    } catch (error) {
        console.error('Google login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const generateAccessToken = (user) => {
  return jwt.sign({ id: user.id, user_role: user.user_role }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

const generateRefreshToken = (user) => {
  return jwt.sign({ id: user.id, user_role: user.user_role }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });
};

exports.register = async (req, res) => {
  const { username, password, email, phone, address } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const otp = generateOTP();
    tempUserStore.set(email, { username, hashedPassword, phone, address, otp });
    sendOTP(email, otp);

    res.json({ msg: "OTP sent to email. Please verify.", email });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const tempUser = tempUserStore.get(email);
    if (!tempUser || tempUser.otp !== otp) {
      return res.status(400).json({ msg: "Invalid OTP" });
    }

    tempUserStore.delete(email);

    const { username, hashedPassword, phone, address } = tempUser;
    let avatarData = {
      url: 'https://t4.ftcdn.net/jpg/05/49/98/39/360_F_549983970_bRCkYfk0P6PP5fKbMhZMIb07mCJ6esXL.jpg',
      public_id: ''
    };

    if (req.file) {
      avatarData = {
        url: req.file.path, 
        public_id: req.file.filename
      };
    }
    const user = new User({ username, password: hashedPassword, email, phone, address, avatar: avatarData });

    await user.save();

    const token = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.json({ token, refreshToken });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};


exports.sendOtpSMS = async (req, res) => {
  const { phoneNumber } = req.body;

  if (!phoneNumber) {
    return res.status(400).json({ message: "Số điện thoại là bắt buộc" });
  }

  try {
    const otp = generateOtp();

    otpCache.set(phoneNumber, { otp, expiresAt: Date.now() + 5 * 60 * 1000 });

    await sendSMS(phoneNumber, `Mã OTP của bạn là: ${otp}`);

    return res.status(200).json({ message: "Gửi OTP thành công" });
  } catch (error) {
    return res.status(500).json({ message: "Có lỗi xảy ra", error: error.message });
  }
};

exports.verifyOtpSMS = async (req, res) => {
  const { phoneNumber, otp } = req.body;

  if (!phoneNumber || !otp) {
    return res.status(400).json({ message: "Số điện thoại và OTP là bắt buộc" });
  }

  try {
    const otpRecord = otpCache.get(phoneNumber);

    if (!otpRecord) {
      return res.status(400).json({ message: "OTP không tồn tại hoặc đã hết hạn" });
    }

    if (otpRecord.otp !== otp || otpRecord.expiresAt < Date.now()) {
      return res.status(400).json({ message: "OTP không hợp lệ hoặc đã hết hạn" });
    }

    await User.findOneAndUpdate({ phoneNumber }, { user_role : "Renter" });

    otpCache.delete(phoneNumber);

    return res.status(200).json({ message: "Xác thực thành công, role đã được cập nhật" });
  } catch (error) {
    return res.status(500).json({ message: "Có lỗi xảy ra", error });
  }
};


function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}


exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "User not found" });
    }

    const otp = generateOTP();
    tempUserStore.set(email, { otp });
    sendOTP(email, otp);

    res.json({ msg: "OTP sent to email. Please verify.", email });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    const tempUser = tempUserStore.get(email);
    if (!tempUser || tempUser.otp !== otp) {
      return res.status(400).json({ msg: "Invalid OTP" });
    }

    tempUserStore.delete(email);

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "User not found" });
    }

    user.password = hashedPassword;
    await user.save();

    res.json({ msg: "Password reset successful" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const token = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    user.refreshToken = refreshToken;
    await user.save();

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        user_role: user.user_role,
        phone: user.phone,
        address: user.address,
      },
      token,
      refreshToken,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

exports.getUserInfo = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(400).json({ msg: "User not authenticated" });
    }

    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.status(200).json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { username, password, email, phone, address, avatar } = req.body;

  try {
    let user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    if (username) user.username = username;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (address) user.address = address;
    if (req.file) {
      if (user.avatar && user.avatar.public_id) {
        await cloudinary.uploader.destroy(user.avatar.public_id);
      }
      user.avatar = {
        url: req.file.path,
        public_id: req.file.filename,
      };
    }
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);

    await user.save();
    res.status(200).json({ msg: "User updated successfully", user });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server error" });
  }
};

//Lấy thông tin người dùng theo id
exports.getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.status(200).json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server error" });
  }
};


// Cập nhật role của người dùng thành Renter
exports.updateUserRoleToRenter = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    user.user_role = 'Renter';
    await user.save();

    res.json({ msg: 'User role updated to Renter' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

//Lấy danh sách người dùng
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server error" });
  }
};

//Xóa người dùng theo id
exports.deleteUserById = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    if (user.user_role == 'Admin') {
      return res.status(403).json({ msg: 'Cannot delete user with role Admin' });
    }

    if (user.avatar && user.avatar.public_id) {
      try {
        await cloudinary.uploader.destroy(user.avatar.public_id);
      } catch (error) {
        console.error('Error deleting avatar from Cloudinary:', error.message);
        return res.status(500).json({ msg: 'Error deleting avatar from Cloudinary' });
      }
    }

    await User.findByIdAndDelete(userId);
    res.json({ msg: 'User deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

//Tạo người dùng cho admin
exports.adminCreateUser = async (req, res) => {
  const { username, password, email, phone, address, user_role } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let avatarData = {
      url: 'https://t4.ftcdn.net/jpg/05/49/98/39/360_F_549983970_bRCkYfk0P6PP5fKbMhZMIb07mCJ6esXL.jpg',
      public_id: ''
    };

    if (req.file) {
      avatarData = {
        url: req.file.path, 
        public_id: req.file.filename
      };
    }

    user = new User({
      username,
      password: hashedPassword,
      email,
      phone,
      address,
      user_role: user_role || 'User',
      avatar: avatarData
    });

    await user.save();
    res.json({ msg: 'User created successfully', user });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.followUser = async (req, res) => {
  try {
    const userToFollow = await User.findById(req.params.userId);
    const currentUser = await User.findById(req.user.id);

    if (!userToFollow) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (currentUser.following.includes(userToFollow._id)) {
      return res.status(400).json({ error: 'Already following this user' });
    }

    currentUser.following.push(userToFollow._id);
    await currentUser.save();

    userToFollow.followers.push(currentUser._id);
    await userToFollow.save();

    res.json({ message: 'Followed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.unfollowUser = async (req, res) => {
  try {
    const userToUnfollow = await User.findById(req.params.userId);
    const currentUser = await User.findById(req.user.id);

    if (!userToUnfollow) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!currentUser.following.includes(userToUnfollow._id)) {
      return res.status(400).json({ error: 'Not following this user' });
    }

    currentUser.following.pull(userToUnfollow._id);
    await currentUser.save();

    userToUnfollow.followers.pull(currentUser._id);
    await userToUnfollow.save();

    res.json({ message: 'Unfollowed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
      return res.status(400).json({ error: 'Invalid user ID format' });
    }

    const profileUser = await User.findById(req.params.userId)
      .select('-password -__v -refreshToken')
      .lean();

    if (!profileUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Lấy thông tin người dùng hiện tại
    const currentUser = await User.findById(req.user.id)
      .select('following followers')
      .lean();

    // Kiểm tra trạng thái follow:
    // 1. isFollowing: người dùng hiện tại có đang theo dõi profileUser không
    const isFollowing = currentUser.following.some(id => 
      id.toString() === profileUser._id.toString()
    );
    
    // 2. isFollower: profileUser có đang theo dõi người dùng hiện tại không
    const isFollower = profileUser.following.some(id => 
      id.toString() === currentUser._id.toString()
    );

    const [followers, following] = await Promise.all([
      User.find({ _id: { $in: profileUser.followers || [] } })
        .select('username avatar _id')
        .lean(),
      
      User.find({ _id: { $in: profileUser.following || [] } })
        .select('username avatar _id')
        .lean()
    ]);

    res.json({
      profile: {
        ...profileUser,
        followers,
        following,
        followersCount: followers.length,
        followingCount: following.length
      },
      followStatus: {
        isFollowing,
        isFollower
      }
    });

  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { 
        details: error.message,
        stack: error.stack 
      })
    });
  }
};