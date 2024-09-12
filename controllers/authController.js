const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { generateOTP } = require('../services/otpService');
const { sendOTP } = require('../services/emailService');

const generateAccessToken = (user) => {
    return jwt.sign({ user: { id: user.id, role: user.user_role } }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

const generateRefreshToken = (user) => {
    return jwt.sign({ user: { id: user.id, role: user.user_role } }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
};

exports.register = async (req, res) => {
    const { username, password, email, user_role, phone, address } = req.body;

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        user = new User({ username, password, email, user_role, phone, address });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        const refreshToken = generateRefreshToken(user);
        user.refreshToken = refreshToken;

        sendOTP(email, generateOTP());

        await user.save();

        const token = generateAccessToken(user);

        res.json({ token, refreshToken });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' });
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
                token: token,
                refreshToken: refreshToken
            }
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.refreshToken = async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(401).json({ msg: 'No refresh token provided' });
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const user = await User.findById(decoded.user.id);

        if (!user || user.refreshToken !== refreshToken) {
            return res.status(401).json({ msg: 'Invalid refresh token' });
        }

        const newAccessToken = generateAccessToken(user);
        res.json({ token: newAccessToken });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.getUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.logout = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        user.refreshToken = '';
        await user.save();
        res.json({ msg: 'User logged out' });
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
}