const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favoriteController');
const auth = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Favorites
 *   description: API quản lý mục yêu thích
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Favorite:
 *       type: object
 *       required:
 *         - id_user_rent
 *         - id_post
 *       properties:
 *         id_user_rent:
 *           type: string
 *           description: ID của người dùng thuê
 *         id_post:
 *           type: string
 *           description: ID của bài đăng
 *       example:
 *         id_user_rent: "60d0fe4f5311236168a109ca"
 *         id_post: "60d0fe4f5311236168a109cb"
 */

/**
 * @swagger
 * /api/favorite/getAll:
 *   get:
 *     summary: Lấy danh sách tất cả các mục yêu thích
 *     tags: [Favorites]
 *     responses:
 *       200:
 *         description: Danh sách các mục yêu thích
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Favorite'
 */
router.get('/getAll',auth(['Admin']), favoriteController.getFavorites);

/**
 * @swagger
 * /api/favorite/user/{userId}:
 *   get:
 *     summary: Lấy danh sách yêu thích theo ID người dùng
 *     tags: [Favorites]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của người dùng
 *     responses:
 *       200:
 *         description: Danh sách mục yêu thích của người dùng
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Favorite'
 *       404:
 *         description: Không tìm thấy mục yêu thích cho người dùng này
 *       500:
 *         description: Lỗi server
 */
router.get('/user/:userId', favoriteController.getFavoritesByUserIdInput);

/**
 * @swagger
 * /api/favorite/user:
 *   get:
 *     summary: Lấy danh mục yêu thích theo ID người dùng hiện đăng nhập
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách các mục yêu thích của người dùng
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Favorite'
 *       404:
 *         description: Không tìm thấy mục yêu thích cho người dùng này
 */
router.get('/user', auth, favoriteController.getFavoritesByUserId);

/**
 * @swagger
 * /api/favorite/{id}:
 *   get:
 *     summary: Lấy một mục yêu thích theo ID
 *     tags: [Favorites]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của mục yêu thích
 *     responses:
 *       200:
 *         description: Thông tin chi tiết của mục yêu thích
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Favorite'
 *       404:
 *         description: Không tìm thấy mục yêu thích
 */
router.get('/:id', favoriteController.getFavoriteById);

/**
 * @swagger
 * /api/favorite/create:
 *   post:
 *     summary: Tạo một mục yêu thích mới
 *     tags: [Favorites]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Favorite'
 *     responses:
 *       201:
 *         description: Mục yêu thích được tạo thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Favorite'
 *       400:
 *         description: Yêu cầu không hợp lệ
 */
router.post('/create', favoriteController.createFavorite);

/**
 * @swagger
 * /api/favorite/delete/{id}:
 *   delete:
 *     summary: Xóa một mục yêu thích
 *     tags: [Favorites]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của mục yêu thích
 *     responses:
 *       200:
 *         description: Mục yêu thích đã được xóa
 *       404:
 *         description: Không tìm thấy mục yêu thích
 */
router.delete('/delete/:id', favoriteController.deleteFavorite);

module.exports = router;