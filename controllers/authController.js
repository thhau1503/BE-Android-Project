const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { sendOTP } = require("../services/emailService");
const { generateOTP } = require("../services/otpService");

const tempUserStore = new Map();

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
    const user = new User({ username, password: hashedPassword, email, phone, address });

    await user.save();

    const token = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.json({ token, refreshToken });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

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

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      user_role: user.user_role,
      phone: user.phone,
      address: user.address,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { username, password, email, phone, address } = req.body;

  try {
    let user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    if (username) user.username = username;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (address) user.address = address;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();
    res.json({ msg: "User updated successfully", user });
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