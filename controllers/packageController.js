const PostPackage = require('../models/PostPackage');
const UserPackage = require('../models/UserPackage');
const User = require('../models/User');
const mongoose = require('mongoose');
const moment = require('moment');
const crypto = require('crypto');
const querystring = require('querystring');
const axios = require('axios');
const Payment = require('../models/Payment');
const config = require('../config/default.json');


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
        process.env.TZ = 'Asia/Ho_Chi_Minh'; // Quan trọng: Đặt múi giờ Việt Nam

        const { packageId, bankCode } = req.body;
        if (!packageId) {
            return res.status(400).json({ error: 'Thiếu thông tin gói' });
        }

        // Lấy thông tin của gói
        const postPackage = await PostPackage.findById(packageId);
        if (!postPackage || !postPackage.isActive) {
            return res.status(404).json({ error: 'Gói không tồn tại hoặc không còn hoạt động' });
        }

        // Lấy thông tin VNPay từ config
        const config = require('../config/default.json');
        const vnp_TmnCode = config.vnp_TmnCode;
        const vnp_HashSecret = config.vnp_HashSecret;
        const vnp_Url = config.vnp_Url;
        const vnp_ReturnUrl = config.vnp_ReturnUrl;

        // Tạo thông tin đơn hàng
        const date = new Date();
        const createDate = moment(date).format('YYYYMMDDHHmmss');
        const orderId = moment(date).format('DDHHmmss');
        const amount = parseInt(postPackage.price); // Đảm bảo là số nguyên
        const orderInfo = `Thanh toan goi ${postPackage.name}`;

        // Xử lý IP
        let ipAddr = req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress;

        if (ipAddr.includes('::ffff:')) {
            ipAddr = ipAddr.split('::ffff:')[1];
        } else if (ipAddr === '::1') {
            ipAddr = '127.0.0.1';
        }

        // Khởi tạo object chứa tham số
        const vnp_Params = {
            vnp_Version: '2.1.0',
            vnp_Command: 'pay',
            vnp_TmnCode: vnp_TmnCode,
            vnp_Locale: 'vn',
            vnp_CurrCode: 'VND',
            vnp_TxnRef: orderId,
            vnp_OrderInfo: orderInfo,
            vnp_OrderType: 'other', // Sửa từ 'billpayment' thành 'other'
            vnp_Amount: amount * 100,
            vnp_ReturnUrl: vnp_ReturnUrl,
            vnp_IpAddr: ipAddr,
            vnp_CreateDate: createDate
        };

        // Thêm bankCode nếu có
        if (bankCode && bankCode !== '') {
            vnp_Params['vnp_BankCode'] = bankCode;
        }

        // Tạo đối tượng Payment
        const payment = new Payment({
            user: req.user.id,
            package: packageId,
            amount,
            orderId,
            status: 'pending',
            paymentMethod: 'vnpay'
        });

        const savedPayment = await payment.save();

        // Sắp xếp tham số và tạo chữ ký (sử dụng qs thay vì querystring)
        const sortedParams = sortObject(vnp_Params);
        const qs = require('qs');
        const signData = qs.stringify(sortedParams, { encode: false });
        const crypto = require('crypto');
        const hmac = crypto.createHmac('sha512', vnp_HashSecret);
        const signed = hmac.update(new Buffer(signData, 'utf-8')).digest('hex');

        // Thêm chữ ký vào params
        const finalParams = { ...sortedParams, vnp_SecureHash: signed };

        // Tạo URL thanh toán
        const paymentUrl = vnp_Url + '?' + qs.stringify(finalParams, { encode: false });

        // Trong createPayment, sau khi tạo signature
        debugSignature('CREATE PAYMENT', vnp_Params, sortedParams, signData, signed);

        res.status(200).json({
            paymentUrl,
            paymentId: savedPayment._id
        });
    } catch (error) {
        console.error('Error creating payment:', error);
        res.status(500).json({ error: 'Lỗi khi tạo giao dịch thanh toán' });
    }
};

exports.paymentCallback = async (req, res) => {
    console.log('=== VNPay Callback Debug ===');
    console.log('Query params:', req.query);
    
    try {
        const vnp_Params = req.query;
        
        if (!vnp_Params || Object.keys(vnp_Params).length === 0) {
            console.log('No query parameters received');
            return res.redirect(`${process.env.CLIENT_URL}/thanks?status=error&message=No parameters received`);
        }
        
        const secureHash = vnp_Params['vnp_SecureHash'];
        
        // Xóa các tham số không cần thiết
        const paramsToVerify = { ...vnp_Params };
        delete paramsToVerify['vnp_SecureHash'];
        delete paramsToVerify['vnp_SecureHashType'];

        // ✅ SỬA: Sử dụng CÙNG CÁCH với createPayment
        const sortedParams = sortObject(paramsToVerify);
        const vnp_HashSecret = config.vnp_HashSecret;
        
        // ✅ SỬA: Sử dụng qs thay vì querystring (giống createPayment)
        const qs = require('qs');
        const signData = qs.stringify(sortedParams, { encode: false });
        const hmac = crypto.createHmac('sha512', vnp_HashSecret);
        
        // ✅ SỬA: Sử dụng new Buffer (giống createPayment)
        const signed = hmac.update(new Buffer(signData, 'utf-8')).digest('hex');

        let paymentStatus = 'failed';
        let message = 'Thanh toán thất bại';

        console.log('=== CALLBACK SIGNATURE DEBUG ===');
        console.log('Params to verify:', paramsToVerify);
        console.log('Sorted params:', sortedParams);
        console.log('Sign data:', signData);
        console.log('Calculated signature:', signed);
        console.log('Received signature:', secureHash);
        console.log('Signatures match:', secureHash === signed);

        if (secureHash === signed) {
            const orderId = vnp_Params['vnp_TxnRef'];
            const responseCode = vnp_Params['vnp_ResponseCode'];

            if (responseCode === '00') {
                paymentStatus = 'success';
                message = 'Thanh toán thành công';

                // Tìm payment
                const payment = await Payment.findOne({ orderId });
                if (payment && payment.status === 'pending') {
                    payment.status = 'completed';
                    payment.responseData = vnp_Params;
                    await payment.save();

                    // Kích hoạt gói cho user
                    try {
                        await activatePackageForUser(payment.user, payment.package, payment._id);
                        console.log('Package activated successfully for user:', payment.user);
                    } catch (activationError) {
                        console.error('Error activating package:', activationError);
                        paymentStatus = 'error';
                        message = 'Thanh toán thành công nhưng có lỗi kích hoạt gói';
                    }
                } else if (!payment) {
                    console.error('Payment not found for orderId:', orderId);
                    paymentStatus = 'error';
                    message = 'Không tìm thấy thông tin giao dịch';
                }
            } else {
                // Cập nhật payment status thành failed
                const payment = await Payment.findOne({ orderId });
                if (payment) {
                    payment.status = 'failed';
                    payment.responseData = vnp_Params;
                    await payment.save();
                }
                
                const errorMessages = {
                    '07': 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).',
                    '09': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.',
                    '10': 'Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần',
                    '11': 'Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch.',
                    '12': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa.',
                    '13': 'Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP).',
                    '24': 'Giao dịch không thành công do: Khách hàng hủy giao dịch',
                    '51': 'Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.',
                    '65': 'Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.',
                    '75': 'Ngân hàng thanh toán đang bảo trì.',
                    '79': 'Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định.'
                };
                message = errorMessages[responseCode] || `Thanh toán thất bại với mã lỗi: ${responseCode}`;
            }
        } else {
            console.error('Invalid signature in VNPay callback');
            paymentStatus = 'error';
            message = 'Chữ ký không hợp lệ';
        }

        const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
        let redirectUrl;
        
        if (paymentStatus === 'success') {
            redirectUrl = `${clientUrl}/thanks?status=success&message=${encodeURIComponent(message)}`;
        } else {
            redirectUrl = `${clientUrl}/thanks?status=${paymentStatus}&message=${encodeURIComponent(message)}`;
        }
        
        console.log('Redirecting to:', redirectUrl);
        // Trong paymentCallback, sau khi tạo signature
        debugSignature('CALLBACK VERIFY', paramsToVerify, sortedParams, signData, signed);
        res.redirect(redirectUrl);
        
    } catch (error) {
        console.error('Error in payment callback:', error);
        const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
        res.redirect(`${clientUrl}/thanks?status=error&message=${encodeURIComponent('Lỗi hệ thống')}`);
    }
};

const debugSignature = (title, params, sortedParams, signData, signature) => {
    console.log(`=== ${title} ===`);
    console.log('Original params:', params);
    console.log('Sorted params:', sortedParams);
    console.log('Sign data:', signData);
    console.log('Signature:', signature);
    console.log('=========================');
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
        }).populate('package');

        console.log(userPackage)    ;

        const all = await UserPackage.find();
        console.log("Tất cả các gói của user:", all);


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
// controllers/packageController.js - Xóa tất cả function cũ và thay bằng:
async function activatePackageForUser(userId, packageId, paymentId) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        console.log('Activating package:', { userId, packageId, paymentId });
        
        // Lấy thông tin gói
        const postPackage = await PostPackage.findById(packageId).session(session);
        if (!postPackage || !postPackage.isActive) {
            throw new Error('Gói không tồn tại hoặc đã bị vô hiệu hóa');
        }

        // Tính thời gian hết hạn
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + postPackage.duration);

        // Tìm và vô hiệu hóa tất cả gói cũ đang hoạt động
        await UserPackage.updateMany(
            {
                user: userId,
                isActive: true,
                expiresAt: { $gt: new Date() }
            },
            { $set: { isActive: false } },
            { session }
        );

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

        const savedUserPackage = await userPackage.save({ session });
        await session.commitTransaction();

        console.log('Package activated successfully:', {
            userPackageId: savedUserPackage._id,
            userId,
            packageId,
            postsLeft: postPackage.postLimit,
            expiresAt: expiryDate
        });

        return savedUserPackage;
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
    let sorted = {};
    let str = [];
    let key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            str.push(encodeURIComponent(key));
        }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
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