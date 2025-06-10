const express = require('express');
const router = express.Router();
const postAlertController = require('../controllers/postAlertController');
const auth = require('../middleware/auth');

// Tạo cảnh báo mới
router.post('/create', auth(), postAlertController.createAlert);

// Lấy tất cả cảnh báo của người dùng
router.get('/', auth(), postAlertController.getUserAlerts);

// Cập nhật cảnh báo
router.put('/:id', auth(), postAlertController.updateAlert);

// Xóa cảnh báo
router.delete('/:id', auth(), postAlertController.deleteAlert);

module.exports = router;