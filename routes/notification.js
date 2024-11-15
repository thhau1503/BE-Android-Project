const express = require('express');
const notificationController = require('../controllers/notificationController');
const auth = require("../middleware/auth");

const router = express.Router();
/**
 * @swagger
 * components:
 *   schemas:
 *     Notification:
 *       type: object
 *       required:
 *         - message
 *         - id_user
 *       properties:
 *         message:
 *           type: string
 *           description: Nội dung thông báo
 *         id_user:
 *           type: string
 *           description: ID của người dùng liên quan đến thông báo
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Ngày tạo thông báo
 *       example:
 *         message: "Thông báo mới"
 *         id_user: "60d0fe4f5311236168a109ca"
 *         createdAt: "2021-07-21T17:32:28Z"
 */

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: API quản lý thông báo
 */

/**
 * @swagger
 * /api/notification/create:
 *   post:
 *     summary: Tạo một thông báo mới
 *     tags: [Notifications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Notification'
 *     responses:
 *       201:
 *         description: Thông báo được tạo thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Notification'
 *       400:
 *         description: Yêu cầu không hợp lệ
 */
router.post('/create', notificationController.createNotification);

/**
 * @swagger
 * /api/notification:
 *   get:
 *     summary: Trả về danh sách tất cả các thông báo
 *     tags: [Notifications]
 *     responses:
 *       200:
 *         description: Danh sách các thông báo
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Notification'
 */
router.get('/', notificationController.getNotifications);

/**
 * @swagger
 * /api/notification/user/{userId}:
 *   get:
 *     summary: Lấy thông báo theo ID người dùng
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của người dùng
 *     responses:
 *       200:
 *         description: Danh sách thông báo của người dùng
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Notification'
 *       404:
 *         description: Không tìm thấy thông báo cho người dùng này
 *       500:
 *         description: Lỗi server
 */
router.get('/user/:userId', notificationController.getNotificationByUserId);

/**
 * @swagger
 * /api/notification/user:
 *   get:
 *     summary: Lấy thông báo theo ID người dùng hiện tại
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách thông báo của người dùng
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                     description: Nội dung thông báo
 *                   id_user:
 *                     type: string
 *                     description: ID của người dùng liên quan đến thông báo
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                     description: Ngày tạo thông báo
 *                 example:
 *                   message: "Thông báo mới"
 *                   id_user: "60d0fe4f5311236168a109ca"
 *                   createdAt: "2021-07-21T17:32:28Z"
 *       500:
 *         description: Lỗi server
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Thông báo lỗi
 */
router.get('/user',auth, notificationController.getNotificationByUserId);

/**
 * @swagger
 * /api/notification/{id}:
 *   get:
 *     summary: Lấy thông báo theo ID
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của thông báo
 *     responses:
 *       200:
 *         description: Thông tin chi tiết của thông báo theo ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Notification'
 *       404:
 *         description: Không tìm thấy thông báo
 */
router.get('/:id', notificationController.getNotificationById);

/**
 * @swagger
 * /api/notification/{id}:
 *   put:
 *     summary: Cập nhật thông báo theo ID
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của thông báo
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Notification'
 *     responses:
 *       200:
 *         description: Thông báo được cập nhật thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Notification'
 *       404:
 *         description: Không tìm thấy thông báo
 *       400:
 *         description: Yêu cầu không hợp lệ
 */
router.put('/:id', notificationController.updateNotification);

/**
 * @swagger
 * /api/notification/{id}:
 *   delete:
 *     summary: Xóa thông báo theo ID
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của thông báo
 *     responses:
 *       200:
 *         description: Thông báo đã được xóa
 *       404:
 *         description: Không tìm thấy thông báo
 */
router.delete('/:id', notificationController.deleteNotification);

module.exports = router;