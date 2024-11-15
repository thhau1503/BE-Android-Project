const Notification = require('../models/Notification');

// Tạo thông báo mới
exports.createNotification = async (req, res) => {
    try {
        const newNotification = new Notification(req.body);
        const savedNotification = await newNotification.save();

        // Gửi thông báo qua WebSocket
        const io = req.app.get('socketio');
        io.emit('savedNotification', savedNotification);

        res.status(201).json(savedNotification);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Lấy tất cả thông báo
exports.getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find().populate("id_user", "username email");
        res.status(200).json(notifications);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Lấy thông báo theo ID
exports.getNotificationById = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);
        if (!notification) {
            return res.status(404).json({ msg: 'Notification not found' });
        }
        res.status(200).json(notification);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Cập nhật thông báo
exports.updateNotification = async (req, res) => {
    try {
        const updatedNotification = await Notification.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedNotification) {
            return res.status(404).json({ msg: 'Notification not found' });
        }
        res.status(200).json(updatedNotification);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Xóa thông báo
exports.deleteNotification = async (req, res) => {
    try {
        const deletedNotification = await Notification.findByIdAndDelete(req.params.id);
        if (!deletedNotification) {
            return res.status(404).json({ msg: 'Notification not found' });
        }
        res.status(200).json({ msg: 'Notification deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

//Lấy thông báo theo id người dùng hiện tại
exports.getNotificationByUserId = async (req, res) => {
    try {
        const notifications = await Notification.find({ id_user: req.user.id });
        res.status(200).json(notifications);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
}