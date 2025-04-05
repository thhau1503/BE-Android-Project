const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");

/**
 * @swagger
 * tags:
 *   name: Chats
 *   description: Quản lý các đoạn chat giữa người dùng
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Chat:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "615a1b5e8e9f8b001f7e3d5a"
 *         members:
 *           type: array
 *           items:
 *             type: string
 *           example: ["615a1b5e8e9f8b001f7e3d58", "615a1b5e8e9f8b001f7e3d59"]
 *         lastMessage:
 *           type: string
 *           example: "615a1b5e8e9f8b001f7e3d5b"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2023-10-05T08:00:00Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2023-10-05T08:00:00Z"
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Error message"
 */

/**
 * @swagger
 * /api/chat/create:
 *   post:
 *     summary: Tạo hoặc lấy đoạn chat giữa 2 người dùng
 *     tags: [Chats]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstUserId
 *               - secondUserId
 *             properties:
 *               firstUserId:
 *                 type: string
 *                 example: "615a1b5e8e9f8b001f7e3d58"
 *               secondUserId:
 *                 type: string
 *                 example: "615a1b5e8e9f8b001f7e3d59"
 *     responses:
 *       200:
 *         description: Trả về đoạn chat đã tồn tại
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Chat'
 *       201:
 *         description: Tạo mới đoạn chat thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Chat'
 *       400:
 *         description: Lỗi validate dữ liệu
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Lỗi server
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/create", chatController.createOrGetChat);
/**
 * @swagger
 * /api/chat/user/{userId}:
 *   get:
 *     summary: Lấy tất cả đoạn chat của một người dùng
 *     tags: [Chats]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         example: "615a1b5e8e9f8b001f7e3d58"
 *     responses:
 *       200:
 *         description: Danh sách các đoạn chat
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Chat'
 *       400:
 *         description: ID người dùng không hợp lệ
 *       404:
 *         description: Không tìm thấy người dùng
 *       500:
 *         description: Lỗi server
 */
router.get("/user/:userId", chatController.getUserChats);
/**
 * @swagger
 * /api/chat/{firstUserId}/{secondUserId}:
 *   get:
 *     summary: Tìm đoạn chat giữa 2 người dùng cụ thể
 *     tags: [Chats]
 *     parameters:
 *       - in: path
 *         name: firstUserId
 *         schema:
 *           type: string
 *         required: true
 *         example: "615a1b5e8e9f8b001f7e3d58"
 *       - in: path
 *         name: secondUserId
 *         schema:
 *           type: string
 *         required: true
 *         example: "615a1b5e8e9f8b001f7e3d59"
 *     responses:
 *       200:
 *         description: Thông tin đoạn chat
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Chat'
 *       400:
 *         description: ID người dùng không hợp lệ
 *       404:
 *         description: Không tìm thấy đoạn chat
 *       500:
 *         description: Lỗi server
 */
router.get("/:firstUserId/:secondUserId", chatController.findChatBetweenUsers);
/**
 * @swagger
 * /api/chat/{chatId}:
 *   delete:
 *     summary: Xóa đoạn chat và các tin nhắn liên quan
 *     tags: [Chats]
 *     parameters:
 *       - in: path
 *         name: chatId
 *         schema:
 *           type: string
 *         required: true
 *         example: "615a1b5e8e9f8b001f7e3d5a"
 *     responses:
 *       200:
 *         description: Xóa thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Chat deleted successfully"
 *                 deletedChat:
 *                   $ref: '#/components/schemas/Chat'
 *       400:
 *         description: ID chat không hợp lệ
 *       404:
 *         description: Không tìm thấy đoạn chat
 *       500:
 *         description: Lỗi server
 */
router.delete("/:chatId", chatController.deleteChat);

module.exports = router;