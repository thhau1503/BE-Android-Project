const PostAlert = require('../models/PostAlert');

exports.createAlert = async (req, res) => {
    try {
        const { criteria, emailFrequency } = req.body;

        const newAlert = new PostAlert({
            user: req.user.id,
            criteria,
            emailFrequency
        });

        await newAlert.save();

        res.status(201).json({
            success: true,
            data: newAlert
        });
    } catch (error) {
        console.error('Error creating post alert:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể tạo cảnh báo mới',
            error: error.message
        });
    }
};

exports.getUserAlerts = async (req, res) => {
    try {
        const alerts = await PostAlert.find({ user: req.user.id });
        
        res.status(200).json({
            success: true,
            count: alerts.length,
            data: alerts
        });
    } catch (error) {
        console.error('Error fetching user alerts:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể lấy danh sách cảnh báo',
            error: error.message
        });
    }
};

exports.updateAlert = async (req, res) => {
    try {
        const { criteria, isActive, emailFrequency } = req.body;
        
        const alert = await PostAlert.findById(req.params.id);
        
        if (!alert) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy cảnh báo'
            });
        }
        
        if (alert.user.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Không có quyền cập nhật cảnh báo này'
            });
        }
        
        const updatedAlert = await PostAlert.findByIdAndUpdate(
            req.params.id,
            { criteria, isActive, emailFrequency },
            { new: true, runValidators: true }
        );
        
        res.status(200).json({
            success: true,
            data: updatedAlert
        });
    } catch (error) {
        console.error('Error updating alert:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể cập nhật cảnh báo',
            error: error.message
        });
    }
};

exports.deleteAlert = async (req, res) => {
    try {
        const alert = await PostAlert.findById(req.params.id);
        
        if (!alert) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy cảnh báo'
            });
        }
        
        // Kiểm tra xem cảnh báo có thuộc về người dùng hiện tại không
        if (alert.user.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Không có quyền xóa cảnh báo này'
            });
        }
        
        await PostAlert.findByIdAndDelete(req.params.id);
        
        res.status(200).json({
            success: true,
            message: 'Đã xóa cảnh báo thành công'
        });
    } catch (error) {
        console.error('Error deleting alert:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể xóa cảnh báo',
            error: error.message
        });
    }
};