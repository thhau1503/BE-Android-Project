const Request = require('../models/Request');
const Notification = require('../models/Notification');
const notificationController = require('./notificationController');

// Tạo yêu cầu mới
exports.createRequest = async (req, res) => {
    try {
        const newRequest = new Request(req.body);
        const savedRequest = await newRequest.save();
        res.status(201).json(savedRequest);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Lấy tất cả yêu cầu
exports.getAllRequests = async (req, res) => {
    try {
        const requests = await Request.find();
        res.status(200).json(requests);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Lấy yêu cầu theo ID
exports.getRequestById = async (req, res) => {
    try {
        const request = await Request.findById(req.params.id);
        if (!request) {
            return res.status(404).json({ error: 'Request not found' });
        }
        res.status(200).json(request);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Cập nhật yêu cầu theo ID
exports.updateRequestById = async (req, res) => {
    try {
        const updatedRequest = await Request.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedRequest) {
            return res.status(404).json({ error: 'Request not found' });
        }
        res.status(200).json(updatedRequest);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Xóa yêu cầu theo ID
exports.deleteRequestById = async (req, res) => {
    try {
        const deletedRequest = await Request.findByIdAndDelete(req.params.id);
        if (!deletedRequest) {
            return res.status(404).json({ error: 'Request not found' });
        }
        res.status(200).json({ message: 'Request deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

//Lấy tất cả yêu cầu theo id người cho thuê
exports.getRequestsByRenterId = async (req, res) => {
    try {
        const requests = await Request.find({ id_renter: req.params.renterId });
        res.status(200).json(requests);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

//Cập nhật trạng thái yêu cầu thành Accepted
exports.acceptRequest = async (req, res) => {
    try {
        const request = await Request.findById(req.params.id);
        if (!request) {
            return res.status(404).json({ error: 'Request not found' });
        }
        request.status = 'Accepted';
        const updatedRequest = await request.save();

        const message = `Your request has been accepted`;
        await notificationController.createNotification({
            body:
            {
                message: message,
                id_user: request.id_user_rent,
            },
            app: req.app,
        });
        res.status(200).json(updatedRequest);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

//Cập nhật trạng thái yêu cầu thành Declined
exports.declineRequest = async (req, res) => {
    try {
        const request = await Request.findById(req.params.id);
        if (!request) {
            return res.status(404).json({ error: 'Request not found' });
        }
        request.status = 'Declined';
        const updatedRequest = await request.save();

        const message = `Your request has been declined`;
        await notificationController.createNotification({
            body:
            {
                message: message,
                id_user: request.id_user_rent,
            },
            app: req.app,
        });
        res.status(200).json(updatedRequest);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

//Lấy danh sách yêu cầu theo id người cho thuê
exports.getRequestsByRenterId = async (req, res) => {
    try {
        const requests = await Request.find({ id_renter: req.params.renterId });
        res.status(200).json(requests);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};