const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageController");
const auth = require("../middleware/auth");

/**
 * @swagger
 * tags:
 *   name: Messages
 *   description: Quản lý tin nhắn trong các đoạn chat
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Message:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "615a1b5e8e9f8b001f7e3d5b"
 *         chatId:
 *           type: string
 *           example: "615a1b5e8e9f8b001f7e3d5a"
 *         sender:
 *           type: string
 *           example: "615a1b5e8e9f8b001f7e3d58"
 *         content:
 *           type: string
 *           example: "Xin chào!"
 *         readBy:
 *           type: array
 *           items:
 *             type: string
 *           example: ["615a1b5e8e9f8b001f7e3d59"]
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2023-10-05T08:05:00Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2023-10-05T08:05:00Z"
 *     MessageListResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         messages:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Message'
 *         pagination:
 *           type: object
 *           properties:
 *             page:
 *               type: integer
 *               example: 1
 *             limit:
 *               type: integer
 *               example: 20
 *             total:
 *               type: integer
 *               example: 50
 *     MessageDeletedResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Message deleted successfully"
 *         deletedMessage:
 *           $ref: '#/components/schemas/Message'
 */

/**
 * @swagger
 * /api/messages/create:
 *   post:
 *     summary: Gửi tin nhắn mới
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - chatId
 *               - content
 *             properties:
 *               chatId:
 *                 type: string
 *                 example: "615a1b5e8e9f8b001f7e3d5a"
 *               content:
 *                 type: string
 *                 example: "Xin chào!"
 *     responses:
 *       201:
 *         description: Tin nhắn được gửi thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   $ref: '#/components/schemas/Message'
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       403:
 *         description: Không có quyền gửi tin nhắn
 *       500:
 *         description: Lỗi server
 */
router.post("/create", auth(['User', 'Renter']), messageController.createMessage);

/**
 * @swagger
 * /api/messages/{messageId}:
 *   get:
 *     summary: Lấy thông tin chi tiết tin nhắn
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         schema:
 *           type: string
 *         required: true
 *         example: "615a1b5e8e9f8b001f7e3d5b"
 *     responses:
 *       200:
 *         description: Thông tin tin nhắn
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   $ref: '#/components/schemas/Message'
 *       403:
 *         description: Không có quyền xem tin nhắn
 *       404:
 *         description: Không tìm thấy tin nhắn
 *       500:
 *         description: Lỗi server
 */
router.get("/:messageId", auth(['User', 'Renter']),messageController.getMessageById);

/**
 * @swagger
 * /api/messages/chat/{chatId}:
 *   get:
 *     summary: Lấy danh sách tin nhắn trong đoạn chat (có phân trang)
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         schema:
 *           type: string
 *         required: true
 *         example: "615a1b5e8e9f8b001f7e3d5a"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Trang hiện tại
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Số lượng tin nhắn mỗi trang
 *     responses:
 *       200:
 *         description: Danh sách tin nhắn
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageListResponse'
 *       400:
 *         description: ID chat không hợp lệ
 *       403:
 *         description: Không có quyền truy cập đoạn chat
 *       500:
 *         description: Lỗi server
 */
router.get("/chat/:chatId",auth(['User', 'Renter']), messageController.getMessageByChatId);

/**
 * @swagger
 * /api/messages/{messageId}:
 *   delete:
 *     summary: Xóa tin nhắn
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         schema:
 *           type: string
 *         required: true
 *         example: "615a1b5e8e9f8b001f7e3d5b"
 *     responses:
 *       200:
 *         description: Xóa tin nhắn thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageDeletedResponse'
 *       403:
 *         description: Không có quyền xóa tin nhắn
 *       404:
 *         description: Không tìm thấy tin nhắn
 *       500:
 *         description: Lỗi server
 */
router.delete("/:messageId", auth(['User', 'Renter']),messageController.deleteMessage);

module.exports = router;