const UserPackage = require('../models/UserPackage');
const PostPackage = require('../models/PostPackage');
const User = require('../models/User');
const mongoose = require('mongoose');

// === USER CONTROLLERS ===

// Lấy gói hiện tại của người dùng
exports.getCurrentPackage = async (req, res) => {
    try {
        const userPackage = await UserPackage.findOne({
            user: req.user.id,
            isActive: true,
            expiresAt: { $gt: new Date() }
        }).populate('package');
        
        if (!userPackage) {
            return res.status(404).json({
                hasActivePackage: false,
                message: 'Bạn chưa có gói đăng bài nào đang hoạt động'
            });
        }
        
        res.status(200).json({
            hasActivePackage: true,
            package: {
                id: userPackage._id,
                name: userPackage.package.name,
                postsLeft: userPackage.postsLeft,
                totalPosts: userPackage.package.postLimit,
                purchasedAt: userPackage.purchasedAt,
                expiresAt: userPackage.expiresAt,
                daysLeft: Math.ceil((userPackage.expiresAt - new Date()) / (1000 * 60 * 60 * 24))
            }
        });
    } catch (error) {
        console.error('Error fetching current package:', error);
        res.status(500).json({ error: 'Lỗi khi lấy thông tin gói hiện tại' });
    }
};

// Lấy lịch sử gói đã mua
exports.getPackageHistory = async (req, res) => {
    try {
        const userPackages = await UserPackage.find({ user: req.user.id })
            .populate('package')
            .populate('paymentId')
            .sort({ createdAt: -1 });
        
        res.status(200).json(userPackages);
    } catch (error) {
        console.error('Error fetching package history:', error);
        res.status(500).json({ error: 'Lỗi khi lấy lịch sử gói' });
    }
};

// Hủy gói hiện tại (nếu muốn cho phép)
exports.cancelCurrentPackage = async (req, res) => {
    try {
        const userPackage = await UserPackage.findOne({
            user: req.user.id,
            isActive: true,
            expiresAt: { $gt: new Date() }
        });
        
        if (!userPackage) {
            return res.status(404).json({ error: 'Không tìm thấy gói đang hoạt động' });
        }
        
        userPackage.isActive = false;
        await userPackage.save();
        
        res.status(200).json({ message: 'Đã hủy gói thành công' });
    } catch (error) {
        console.error('Error canceling package:', error);
        res.status(500).json({ error: 'Lỗi khi hủy gói' });
    }
};

// === ADMIN CONTROLLERS ===

// Admin: Lấy tất cả gói của người dùng
exports.getAllUserPackages = async (req, res) => {
    try {
        const { userId, status, page = 1, limit = 10 } = req.query;
        
        const query = {};
        
        if (userId) {
            query.user = userId;
        }
        
        if (status) {
            if (status === 'active') {
                query.isActive = true;
                query.expiresAt = { $gt: new Date() };
            } else if (status === 'expired') {
                query.expiresAt = { $lt: new Date() };
            } else if (status === 'inactive') {
                query.isActive = false;
            }
        }
        
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const userPackages = await UserPackage.find(query)
            .populate('user', 'username email phone')
            .populate('package')
            .populate('paymentId')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));
        
        const total = await UserPackage.countDocuments(query);
        
        res.status(200).json({
            userPackages,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error fetching all user packages:', error);
        res.status(500).json({ error: 'Lỗi khi lấy danh sách gói người dùng' });
    }
};

// Admin: Lấy chi tiết gói người dùng
exports.getUserPackageById = async (req, res) => {
    try {
        const userPackage = await UserPackage.findById(req.params.id)
            .populate('user', 'username email phone')
            .populate('package')
            .populate('paymentId');
        
        if (!userPackage) {
            return res.status(404).json({ error: 'Không tìm thấy gói' });
        }
        
        res.status(200).json(userPackage);
    } catch (error) {
        console.error('Error fetching user package:', error);
        res.status(500).json({ error: 'Lỗi khi lấy thông tin gói' });
    }
};

// Admin: Cập nhật gói người dùng
exports.updateUserPackage = async (req, res) => {
    try {
        const { postsLeft, expiresAt, isActive } = req.body;
        
        const updateData = {};
        if (postsLeft !== undefined) updateData.postsLeft = postsLeft;
        if (expiresAt !== undefined) updateData.expiresAt = new Date(expiresAt);
        if (isActive !== undefined) updateData.isActive = isActive;
        
        const userPackage = await UserPackage.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        ).populate('package');
        
        if (!userPackage) {
            return res.status(404).json({ error: 'Không tìm thấy gói' });
        }
        
        res.status(200).json(userPackage);
    } catch (error) {
        console.error('Error updating user package:', error);
        res.status(500).json({ error: 'Lỗi khi cập nhật gói' });
    }
};

// Admin: Xóa gói người dùng
exports.deleteUserPackage = async (req, res) => {
    try {
        const userPackage = await UserPackage.findByIdAndDelete(req.params.id);
        
        if (!userPackage) {
            return res.status(404).json({ error: 'Không tìm thấy gói' });
        }
        
        res.status(200).json({ message: 'Đã xóa gói thành công' });
    } catch (error) {
        console.error('Error deleting user package:', error);
        res.status(500).json({ error: 'Lỗi khi xóa gói' });
    }
};

// Admin: Tạo gói cho người dùng (thêm gói thủ công)
exports.createUserPackage = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
        const { userId, packageId, expiresAt, postsLeft, isActive } = req.body;
        
        // Kiểm tra user và package tồn tại
        const [user, postPackage] = await Promise.all([
            User.findById(userId).session(session),
            PostPackage.findById(packageId).session(session)
        ]);
        
        if (!user) {
            await session.abortTransaction();
            return res.status(404).json({ error: 'Không tìm thấy người dùng' });
        }
        
        if (!postPackage) {
            await session.abortTransaction();
            return res.status(404).json({ error: 'Không tìm thấy gói' });
        }
        
        // Kiểm tra người dùng có gói đang hoạt động không
        if (isActive) {
            const existingPackage = await UserPackage.findOne({
                user: userId,
                isActive: true,
                expiresAt: { $gt: new Date() }
            }).session(session);
            
            if (existingPackage) {
                // Vô hiệu hóa gói cũ
                existingPackage.isActive = false;
                await existingPackage.save({ session });
            }
        }
        
        // Tạo gói mới
        const newUserPackage = new UserPackage({
            user: userId,
            package: packageId,
            purchasedAt: new Date(),
            expiresAt: expiresAt || new Date(Date.now() + postPackage.duration * 24 * 60 * 60 * 1000),
            postsLeft: postsLeft !== undefined ? postsLeft : postPackage.postLimit,
            isActive: isActive !== undefined ? isActive : true
        });
        
        await newUserPackage.save({ session });
        await session.commitTransaction();
        
        const createdPackage = await UserPackage.findById(newUserPackage._id)
            .populate('user', 'username email')
            .populate('package');
        
        res.status(201).json(createdPackage);
    } catch (error) {
        await session.abortTransaction();
        console.error('Error creating user package:', error);
        res.status(500).json({ error: 'Lỗi khi tạo gói cho người dùng' });
    } finally {
        session.endSession();
    }
};

// === HELPERS ===

// Giảm số lượng bài đăng còn lại
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

// Kiểm tra quyền đăng bài
exports.checkPostPermission = async (req, res, next) => {
    try {
        const userPackage = await UserPackage.findOne({
            user: req.user.id,
            isActive: true,
        });
        
        if (!userPackage) {
            // Kiểm tra xem có gói nào đang hoạt động không
            const activePackage = await UserPackage.findOne({
                user: req.user.id,
                isActive: true,
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
        
        req.userPackage = userPackage;
        next();
    } catch (error) {
        console.error('Error checking post permission:', error);
        res.status(500).json({ error: 'Lỗi khi kiểm tra quyền đăng bài' });
    }
};

// Tạo thông tin thống kê về gói
exports.getPackageStats = async (req, res) => {
    try {
        const stats = await UserPackage.aggregate([
            {
                $facet: {
                    "activePackages": [
                        { $match: { isActive: true, expiresAt: { $gt: new Date() } } },
                        { $count: "count" }
                    ],
                    "expiredPackages": [
                        { $match: { expiresAt: { $lt: new Date() } } },
                        { $count: "count" }
                    ],
                    "totalRevenue": [
                        { $lookup: { from: "payments", localField: "paymentId", foreignField: "_id", as: "payment" } },
                        { $unwind: "$payment" },
                        { $match: { "payment.status": "completed" } },
                        { $group: { _id: null, total: { $sum: "$payment.amount" } } }
                    ],
                    "packageDistribution": [
                        { $lookup: { from: "postpackages", localField: "package", foreignField: "_id", as: "packageInfo" } },
                        { $unwind: "$packageInfo" },
                        { $group: { _id: "$packageInfo.name", count: { $sum: 1 } } }
                    ]
                }
            }
        ]);
        
        res.status(200).json({
            activePackages: stats[0].activePackages[0]?.count || 0,
            expiredPackages: stats[0].expiredPackages[0]?.count || 0,
            totalRevenue: stats[0].totalRevenue[0]?.total || 0,
            packageDistribution: stats[0].packageDistribution
        });
    } catch (error) {
        console.error('Error getting package stats:', error);
        res.status(500).json({ error: 'Lỗi khi lấy thống kê gói' });
    }
};