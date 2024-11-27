const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageController");

/**
 * @swagger
 * components:
 *   schemas:
 *     Message:
 *       type: object
 *       required:
 *         - chatId
 *         - senderId
 *         - content
 *       properties:
 *         chatId:
 *           type: string
 *           description: ID của đoạn chat
 *         sender:
 *           type: string
 *           description: ID của người gửi
 *         content:
 *           type: string
 *           description: Nội dung tin nhắn
 *       example:
 *         chatId: "6724a39cb13ff366845f9606"
 *         sender: "66f3e51e32c1888b7b514852"
 *         content: "Hello, how are you?"
 */


/**
 * @swagger
 * /api/message/create:
 *   post:
 *     summary: Tạo tin nhắn mới
 *     tags: [Messages]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Message'
 *     responses:
 *       200:
 *         description: Tin nhắn được tạo thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Message'
 *       500:
 *         description: Lỗi server
 */
router.post('/create', messageController.createMessage);

/**
 * @swagger
 * /api/message/{messageId}:
 *   get:
 *     summary: Lấy tin nhắn theo ID
 *     tags: [Messages]
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của tin nhắn
 *     responses:
 *       200:
 *         description: Thông tin tin nhắn
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Message'
 *       404:
 *         description: Không tìm thấy tin nhắn
 *       500:
 *         description: Lỗi server
 */
router.get('/:messageId', messageController.getMessageById);

/**
 * @swagger
 * /api/message/chat/{chatId}:
 *   get:
 *     summary: Lấy tin nhắn theo ID của đoạn chat
 *     tags: [Messages]
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của đoạn chat
 *     responses:
 *       200:
 *         description: Danh sách tin nhắn của đoạn chat
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Message'
 *       500:
 *         description: Lỗi server
 */
router.get('/chat/:chatId', messageController.getMessageByChatId);

/**
 * @swagger
 * /api/message/{messageId}:
 *   delete:
 *     summary: Xóa tin nhắn
 *     tags: [Messages]
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của tin nhắn
 *     responses:
 *       200:
 *         description: Tin nhắn đã được xóa
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Message'
 *       404:
 *         description: Không tìm thấy tin nhắn
 *       500:
 *         description: Lỗi server
 */
router.delete('/:messageId', messageController.deleteMessage);

/**
 * @swagger
 * /api/messages/find/{firstUserId}/{secondUserId}:
 *   get:
 *     summary: Tìm tin nhắn giữa hai người dùng
 *     tags: [Messages]
 *     parameters:
 *       - in: path
 *         name: firstUserId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của người dùng thứ nhất
 *       - in: path
 *         name: secondUserId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của người dùng thứ hai
 *     responses:
 *       200:
 *         description: Danh sách tin nhắn giữa hai người dùng
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Message'
 *       500:
 *         description: Lỗi server
 */
router.get('/find/:firstUserId/:secondUserId', messageController.findMessage);

module.exports = router;