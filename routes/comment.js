const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
/**
 * @swagger
 * components:
 *   schemas:
 *     Comment:
 *       type: object
 *       required:
 *         - user
 *         - house
 *         - rating
 *         - comment
 *       properties:
 *         user:
 *           type: string
 *           description: ID của người đánh giá
 *         house:
 *           type: string
 *           description: ID của nhà trọ được đánh giá
 *         rating:
 *           type: number
 *           description: Đánh giá (từ 1 đến 5)
 *         comment:
 *           type: string
 *           description: Nội dung bình luận
 *       example:
 *         user: "66f9623f5284e1e22c47cc9a"
 *         house: "66f3a7e65401572e16b14bf6"
 *         rating: 5
 *         comment: "Nhà trọ rất tốt"
 */

/**
 * @swagger
 * /api/comment/create:
 *   post:
 *     summary: Tạo bình luận mới
 *     tags: [Comments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Comment'
 *     responses:
 *       201:
 *         description: Bình luận được tạo thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       500:
 *         description: Lỗi server
 */
router.post('/create', commentController.createComment);

/**
 * @swagger
 * /api/comment/getAll:
 *   get:
 *     summary: Lấy tất cả bình luận
 *     tags: [Comments]
 *     responses:
 *       200:
 *         description: Danh sách bình luận
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Comment'
 *       500:
 *         description: Lỗi server
 */
router.get('/getAll', commentController.getAllComments);

/**
 * @swagger
 * /api/comment/{id}:
 *   get:
 *     summary: Lấy bình luận theo ID
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của bình luận
 *     responses:
 *       200:
 *         description: Thông tin bình luận
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       404:
 *         description: Không tìm thấy bình luận
 *       500:
 *         description: Lỗi server
 */
router.get('/:id', commentController.getCommentById);

/**
 * @swagger
 * /api/comment/post/{postId}:
 *   get:
 *     summary: Lấy bình luận theo ID bài đăng
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của bài đăng
 *     responses:
 *       200:
 *         description: Danh sách bình luận của bài đăng
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Comment'
 *       500:
 *         description: Lỗi server
 */
router.get('/post/:postId', commentController.getCommentsByPostId);

/**
 * @swagger
 * /api/comment/{id}:
 *   put:
 *     summary: Cập nhật bình luận theo ID
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của bình luận
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Comment'
 *     responses:
 *       200:
 *         description: Bình luận được cập nhật thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       404:
 *         description: Không tìm thấy bình luận
 *       500:
 *         description: Lỗi server
 */
router.put('/:id', commentController.updateCommentById);

/**
 * @swagger
 * /api/comment/delete/{id}:
 *   delete:
 *     summary: Xóa bình luận theo ID
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của bình luận
 *     responses:
 *       200:
 *         description: Bình luận được xóa thành công
 *       404:
 *         description: Không tìm thấy bình luận
 *       500:
 *         description: Lỗi server
 */
router.delete('/delete/:id', commentController.deleteCommentById);

module.exports = router;