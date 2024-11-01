const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');


/**
 * @swagger
 * components:
 *   schemas:
 *     Request:
 *       type: object
 *       required:
 *         - id_user_rent
 *         - id_renter
 *         - id_post
 *       properties:
 *         id_user_rent:
 *           type: string
 *           description: ID của người thuê
 *         id_renter:
 *           type: string
 *           description: ID của người cho thuê
 *         id_post:
 *           type: string
 *           description: ID của bài đăng
 *         date_time:
 *           type: string
 *           format: date-time
 *           description: Ngày và giờ của yêu cầu
 *       example:
 *         id_user_rent: "60d0fe4f5311236168a109cb"
 *         id_renter: "60d0fe4f5311236168a109cc"
 *         id_post: "60d0fe4f5311236168a109cd"
 *         date_time: "2021-07-21T17:32:28Z"
 */

/**
 * @swagger
 * /api/request/create:
 *   post:
 *     summary: Tạo yêu cầu mới
 *     tags: [Requests]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Request'
 *     responses:
 *       201:
 *         description: Yêu cầu được tạo thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Request'
 *       500:
 *         description: Lỗi server
 */
router.post('/create', requestController.createRequest);

/**
 * @swagger
 * /api/request/getAll:
 *   get:
 *     summary: Lấy tất cả yêu cầu
 *     tags: [Requests]
 *     responses:
 *       200:
 *         description: Danh sách yêu cầu
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Request'
 *       500:
 *         description: Lỗi server
 */
router.get('/getAll', requestController.getAllRequests);

/**
 * @swagger
 * /api/request/{id}:
 *   get:
 *     summary: Lấy yêu cầu theo ID
 *     tags: [Requests]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của yêu cầu
 *     responses:
 *       200:
 *         description: Thông tin yêu cầu
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Request'
 *       404:
 *         description: Không tìm thấy yêu cầu
 *       500:
 *         description: Lỗi server
 */
router.get('/:id', requestController.getRequestById);

/**
 * @swagger
 * /api/request/renter/{renterId}:
 *   get:
 *     summary: Lấy yêu cầu theo ID chủ bài đăng
 *     tags: [Requests]
 *     parameters:
 *       - in: path
 *         name: renterId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của chủ bài đăng
 *     responses:
 *       200:
 *         description: Danh sách yêu cầu của chủ bài đăng
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Request'
 *       500:
 *         description: Lỗi server
 */
router.get('/renter/:renterId', requestController.getRequestsByRenterId);

/**
 * @swagger
 * /api/request/{id}:
 *   put:
 *     summary: Cập nhật yêu cầu theo ID
 *     tags: [Requests]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của yêu cầu
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Request'
 *     responses:
 *       200:
 *         description: Yêu cầu được cập nhật thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Request'
 *       404:
 *         description: Không tìm thấy yêu cầu
 *       500:
 *         description: Lỗi server
 */
router.put('/:id', requestController.updateRequestById);

/**
 * @swagger
 * /api/request/{id}:
 *   delete:
 *     summary: Xóa yêu cầu theo ID
 *     tags: [Requests]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của yêu cầu
 *     responses:
 *       200:
 *         description: Yêu cầu được xóa thành công
 *       404:
 *         description: Không tìm thấy yêu cầu
 *       500:
 *         description: Lỗi server
 */
router.delete('/:id', requestController.deleteRequestById);

module.exports = router;