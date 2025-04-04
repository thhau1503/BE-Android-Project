// controllers/packageController.js
const PostPackage = require('../models/PostPackage');
const UserPackage = require('../models/UserPackage');
const User = require('../models/User');
const mongoose = require('mongoose');
const moment = require('moment');
const crypto = require('crypto');
const querystring = require('querystring');
const axios = require('axios');
const Payment = require('../models/Payment');

// === ADMIN CONTROLLERS ===

// Lấy tất cả các gói (admin panel)
exports.getAllPackages = async (req, res) => {
    try {
        const packages = await PostPackage.find().sort({ price: 1 });
        res.status(200).json(packages);
    } catch (error) {
        console.error('Error fetching packages:', error);
        res.status(500).json({ error: 'Lỗi khi lấy danh sách gói' });
    }
};

// Lấy gói theo ID
exports.getPackageById = async (req, res) => {
    try {
        const postPackage = await PostPackage.findById(req.params.id);
        if (!postPackage) {
            return res.status(404).json({ error: 'Không tìm thấy gói' });
        }
        res.status(200).json(postPackage);
    } catch (error) {
        console.error('Error fetching package:', error);
        res.status(500).json({ error: 'Lỗi khi lấy thông tin gói' });
    }
};

// Tạo gói mới (admin only)
exports.createPackage = async (req, res) => {
    try {
        const { name, description, price, duration, postLimit, features } = req.body;

        // Validate input
        if (!name || !description || !price || !duration || !postLimit) {
            return res.status(400).json({ error: 'Vui lòng điền đầy đủ thông tin' });
        }

        const newPackage = new PostPackage({
            name,
            description,
            price,
            duration,
            postLimit,
            features: features || []
        });

        const savedPackage = await newPackage.save();
        res.status(201).json(savedPackage);
    } catch (error) {
        console.error('Error creating package:', error);
        res.status(500).json({ error: 'Lỗi khi tạo gói mới' });
    }
};

// Cập nhật gói (admin only)
exports.updatePackage = async (req, res) => {
    try {
        const { name, description, price, duration, postLimit, features, isActive } = req.body;

        const updatedPackage = await PostPackage.findByIdAndUpdate(
            req.params.id,
            {
                name,
                description,
                price,
                duration,
                postLimit,
                features,
                isActive
            },
            { new: true, runValidators: true }
        );

        if (!updatedPackage) {
            return res.status(404).json({ error: 'Không tìm thấy gói' });
        }

        res.status(200).json(updatedPackage);
    } catch (error) {
        console.error('Error updating package:', error);
        res.status(500).json({ error: 'Lỗi khi cập nhật gói' });
    }
};

// Xóa gói (admin only - soft delete)
exports.deletePackage = async (req, res) => {
    try {
        const deletedPackage = await PostPackage.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );

        if (!deletedPackage) {
            return res.status(404).json({ error: 'Không tìm thấy gói' });
        }

        res.status(200).json({ message: 'Gói đã được vô hiệu hóa' });
    } catch (error) {
        console.error('Error deleting package:', error);
        res.status(500).json({ error: 'Lỗi khi xóa gói' });
    }
};

// === USER CONTROLLERS ===

// Lấy tất cả các gói đang hoạt động (cho user)
exports.getActivePackages = async (req, res) => {
    try {
        const packages = await PostPackage.find({ isActive: true }).sort({ price: 1 });
        res.status(200).json(packages);
    } catch (error) {
        console.error('Error fetching active packages:', error);
        res.status(500).json({ error: 'Lỗi khi lấy danh sách gói' });
    }
};

// Tạo giao dịch thanh toán với VNPay
exports.createPayment = async (req, res) => {
    try {
        const { packageId } = req.body;
        if (!packageId) {
            return res.status(400).json({ error: 'Thiếu thông tin gói' });
        }

        // Lấy thông tin của gói
        const postPackage = await PostPackage.findById(packageId);
        if (!postPackage || !postPackage.isActive) {
            return res.status(404).json({ error: 'Gói không tồn tại hoặc không còn hoạt động' });
        }

        // Lấy thông tin VNPay từ config thay vì env
        const config = require('../config/default.json');
        const vnp_TmnCode = config.vnp_TmnCode;
        const vnp_HashSecret = config.vnp_HashSecret;
        const vnp_Url = config.vnp_Url;
        const vnp_ReturnUrl = config.vnp_ReturnUrl;

        // Tạo thông tin đơn hàng
        const orderId = moment().format('DDHHmmss');
        const amount = postPackage.price; // Số tiền
        const orderInfo = `Thanh toan goi ${postPackage.name}`;
        const orderType = 'billpayment';
        const locale = 'vn';
        const currCode = 'VND';

        // Khởi tạo object chứa tham số
        const vnp_Params = {
            vnp_Version: '2.1.0',
            vnp_Command: 'pay',
            vnp_TmnCode: vnp_TmnCode,
            vnp_Locale: locale,
            vnp_CurrCode: currCode,
            vnp_TxnRef: orderId,
            vnp_OrderInfo: orderInfo,
            vnp_OrderType: orderType,
            vnp_Amount: amount * 100, // Nhân 100 vì VNPay yêu cầu
            vnp_ReturnUrl: vnp_ReturnUrl,
            vnp_IpAddr: req.ip || '127.0.0.1',
            vnp_CreateDate: moment().format('YYYYMMDDHHmmss')
        };

        // Tạo đối tượng Payment mới
        const payment = new Payment({
            user: req.user.id,
            package: packageId,
            amount,
            orderId,
            status: 'pending',
            paymentMethod: 'vnpay'
        });

        const savedPayment = await payment.save();

        // Sắp xếp các tham số theo key
        const sortedParams = sortObject(vnp_Params);

        // Debug log
        console.log('Sorted params before signing:', sortedParams);

        // Tạo chữ ký
        const signData = querystring.stringify(sortedParams, { encode: false });
        const hmac = crypto.createHmac('sha512', vnp_HashSecret);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
        sortedParams['vnp_SecureHash'] = signed;

        // Tạo URL thanh toán đúng cách
        // Thay thế đoạn tạo paymentUrl bằng cách này:
        const paymentUrl = vnp_Url + '?' + new URLSearchParams(sortedParams).toString();

        console.log('Final payment URL:', paymentUrl);

        // Trả về URL thanh toán cho client
        res.status(200).json({
            paymentUrl,
            paymentId: savedPayment._id
        });
    } catch (error) {
        console.error('Error creating payment:', error);
        res.status(500).json({ error: 'Lỗi khi tạo giao dịch thanh toán' });
    }
};

// Xác nhận thanh toán từ VNPay callback
exports.paymentCallback = async (req, res) => {
    try {
        const vnp_Params = req.query;
        const secureHash = vnp_Params['vnp_SecureHash'];

        // Xóa các tham số không cần thiết
        delete vnp_Params['vnp_SecureHash'];
        delete vnp_Params['vnp_SecureHashType'];

        // Sắp xếp các tham số
        const sortedParams = sortObject(vnp_Params);

        // Kiểm tra chữ ký
        const vnp_HashSecret = process.env.VNP_HASH_SECRET;
        const signData = querystring.stringify(sortedParams, { encode: false });
        const hmac = crypto.createHmac('sha512', vnp_HashSecret);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

        let paymentStatus = 'failed';
        let message = 'Thanh toán thất bại';

        if (secureHash === signed) {
            // Kiểm tra kết quả giao dịch
            const orderId = vnp_Params['vnp_TxnRef'];
            const responseCode = vnp_Params['vnp_ResponseCode'];

            if (responseCode === '00') {
                paymentStatus = 'success';
                message = 'Thanh toán thành công';

                // Cập nhật payment
                const payment = await Payment.findOne({ orderId });
                if (payment) {
                    payment.status = 'completed';
                    payment.responseData = vnp_Params;
                    await payment.save();

                    // Kích hoạt gói cho user
                    await activatePackageForUser(payment.user, payment.package, payment._id);
                }
            }
        }

        // Redirect về trang kết quả thanh toán
        res.redirect(`${process.env.CLIENT_URL}/payment-result?status=${paymentStatus}&message=${encodeURIComponent(message)}`);
    } catch (error) {
        console.error('Error in payment callback:', error);
        res.redirect(`${process.env.CLIENT_URL}/payment-result?status=error&message=${encodeURIComponent('Lỗi hệ thống')}`);
    }
};

// Kiểm tra trạng thái thanh toán
exports.verifyPayment = async (req, res) => {
    try {
        const { paymentId } = req.params;

        const payment = await Payment.findById(paymentId)
            .populate('package')
            .populate('user', 'username email');

        if (!payment) {
            return res.status(404).json({ error: 'Không tìm thấy giao dịch' });
        }

        res.status(200).json({
            status: payment.status,
            package: payment.package,
            amount: payment.amount,
            createdAt: payment.createdAt
        });
    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).json({ error: 'Lỗi khi kiểm tra thanh toán' });
    }
};

// Kiểm tra gói hiện tại của user
exports.getCurrentPackage = async (req, res) => {
    try {
        // Tìm gói đang hoạt động của user
        const userPackage = await UserPackage.findOne({
            user: req.user.id,
            isActive: true,
            expiresAt: { $gt: new Date() }
        }).populate('package');

        if (!userPackage) {
            return res.status(404).json({
                error: 'Không tìm thấy gói đang hoạt động',
                hasActivePackage: false
            });
        }

        res.status(200).json({
            hasActivePackage: true,
            package: userPackage.package,
            postsLeft: userPackage.postsLeft,
            purchasedAt: userPackage.purchasedAt,
            expiresAt: userPackage.expiresAt,
            isActive: userPackage.isActive
        });
    } catch (error) {
        console.error('Error fetching current package:', error);
        res.status(500).json({ error: 'Lỗi khi lấy thông tin gói hiện tại' });
    }
};

// Lịch sử gói đã mua
exports.getUserPackageHistory = async (req, res) => {
    try {
        const userPackages = await UserPackage.find({ user: req.user.id })
            .populate('package')
            .populate('paymentId')
            .sort({ createdAt: -1 });

        res.status(200).json(userPackages);
    } catch (error) {
        console.error('Error fetching user package history:', error);
        res.status(500).json({ error: 'Lỗi khi lấy lịch sử gói' });
    }
};

// === HELPER FUNCTIONS ===

// Kích hoạt gói cho user
async function activatePackageForUser(userId, packageId, paymentId) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Lấy thông tin gói
        const postPackage = await PostPackage.findById(packageId).session(session);
        if (!postPackage) {
            throw new Error('Gói không tồn tại');
        }

        // Tính thời gian hết hạn
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + postPackage.duration);

        // Kiểm tra xem user có gói đang hoạt động không
        const existingPackage = await UserPackage.findOne({
            user: userId,
            isActive: true,
            expiresAt: { $gt: new Date() }
        }).session(session);

        if (existingPackage) {
            // Nếu đã có gói đang hoạt động, vô hiệu hóa gói cũ
            existingPackage.isActive = false;
            await existingPackage.save({ session });
        }

        // Tạo gói mới
        const userPackage = new UserPackage({
            user: userId,
            package: packageId,
            purchasedAt: new Date(),
            expiresAt: expiryDate,
            postsLeft: postPackage.postLimit,
            isActive: true,
            paymentId: paymentId
        });

        await userPackage.save({ session });
        await session.commitTransaction();

        return userPackage;
    } catch (error) {
        await session.abortTransaction();
        console.error('Error activating package:', error);
        throw error;
    } finally {
        session.endSession();
    }
}

// Sắp xếp các tham số theo key (yêu cầu của VNPay)
function sortObject(obj) {
    const sorted = {};
    const keys = Object.keys(obj).sort();

    for (const key of keys) {
        if (obj.hasOwnProperty(key)) {
            sorted[key] = obj[key];
        }
    }

    return sorted;
}

// Middleware để kiểm tra xem user có thể đăng bài hay không
exports.checkPostPermission = async (req, res, next) => {
    try {
        // Tìm gói đang hoạt động của user
        const userPackage = await UserPackage.findOne({
            user: req.user.id,
            isActive: true,
            expiresAt: { $gt: new Date() },
            postsLeft: { $gt: 0 }
        });

        // Kiểm tra user có mua gói nào không hoặc gói có còn hiệu lực không
        if (!userPackage) {
            const activePackage = await UserPackage.findOne({
                user: req.user.id,
                isActive: true,
                expiresAt: { $gt: new Date() }
            });

            if (!activePackage) {
                return res.status(403).json({
                    error: 'no_active_package',
                    message: 'Bạn cần mua gói để đăng bài'
                });
            } else {
                return res.status(403).json({
                    error: 'no_posts_remaining',
                    message: 'Bạn đã sử dụng hết lượt đăng bài, vui lòng nâng cấp gói'
                });
            }
        }

        // Lưu thông tin gói vào request để sử dụng trong controller tạo post
        req.userPackage = userPackage;
        next();
    } catch (error) {
        console.error('Error checking post permission:', error);
        res.status(500).json({ error: 'Lỗi khi kiểm tra quyền đăng bài' });
    }
};

// Cập nhật số lượng bài đăng còn lại sau khi đăng bài
exports.decrementPostCount = async (userId) => {
    try {
        const userPackage = await UserPackage.findOne({
            user: userId,
            isActive: true,
            expiresAt: { $gt: new Date() },
            postsLeft: { $gt: 0 }
        });

        if (userPackage) {
            userPackage.postsLeft -= 1;
            await userPackage.save();
            return true;
        }

        return false;
    } catch (error) {
        console.error('Error decrementing post count:', error);
        throw error;
    }
};