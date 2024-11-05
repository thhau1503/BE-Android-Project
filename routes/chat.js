const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");

/**
 * @swagger
 * components:
 *   schemas:
 *     Chat:
 *       type: object
 *       required:
 *         - members
 *       properties:
 *         members:
 *           type: array
 *           items:
 *             type: string
 *             description: Danh sách ID của các thành viên trong cuộc trò chuyện
 */

/**
 * @swagger
 * /api/chat/user/{userId}:
 *   get:
 *     summary: Lấy tất cả cuộc trò chuyện của một người dùng
 *     tags: [Chat]
 *     description: Lấy tất cả cuộc trò chuyện mà một người dùng tham gia dựa trên ID của họ.
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user
 *     responses:
 *       200:
 *         description: A list of chats
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Chat'
 *       500:
 *         description: Server error
 */
router.get("/user/:userId", chatController.getChatByUserId);

/**
 * @swagger
 * /api/chat/find/{firstUserId}/{secondUserId}:
 *   get:
 *     summary: Tìm cuộc trò chuyện giữa hai người dùng bằng ID của họ
 *     tags: [Chat]
 *     description: Tìm cuộc trò chuyện giữa hai người dùng bằng ID của họ.
 *     parameters:
 *       - in: path
 *         name: firstUserId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the first user
 *       - in: path
 *         name: secondUserId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the second user
 *     responses:
 *       200:
 *         description: The chat between the two users
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Chat'
 *       500:
 *         description: Server error
 */
router.get("/find/:firstUserId/:secondUserId", chatController.findChat);

/**
 * @swagger
 * /api/chat/create:
 *   post:
 *     summary: Tạo một cuộc trò chuyện mới
 *     tags: [Chat]
 *     description: Tạo một cuộc trò chuyện mới giữa hai người dùng.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstUserId:
 *                 type: string
 *               secondUserId:
 *                 type: string
 *     responses:
 *       200:
 *         description: The created chat
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Chat'
 *       500:
 *         description: Server error
 */
router.post("/create", chatController.createChat);

module.exports = router;
