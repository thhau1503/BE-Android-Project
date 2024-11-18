const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const auth = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: API quản lý báo cáo
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Report:
 *       type: object
 *       required:
 *         - id_user
 *         - id_post
 *         - report_reason
 *       properties:
 *         id_user:
 *           type: string
 *           description: ID của người dùng
 *         id_post:
 *           type: string
 *           description: ID của bài đăng
 *         report_reason:
 *           type: string
 *           description: Lý do báo cáo
 *         description:
 *           type: string
 *           description: Mô tả chi tiết
 *         status:
 *           type: string
 *           enum: ['Pending', 'Processing', 'Resolved']
 *           description: Trạng thái của báo cáo
 *       example:
 *         id_user: "60d0fe4f5311236168a109ca"
 *         id_post: "60d0fe4f5311236168a109cb"
 *         report_reason: "Spam"
 *         description: "This post is spam."
 */

/**
 * @swagger
 * /api/report/getAll:
 *   get:
 *     summary: Lấy tất cả báo cáo
 *     tags: [Reports]
 *     responses:
 *       200:
 *         description: Danh sách báo cáo
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Report'
 *       500:
 *         description: Lỗi server
 */
router.get('/getAll', auth(['Admin']),reportController.getReports);

/**
 * @swagger
 * /api/report/{id}:
 *   get:
 *     summary: Lấy báo cáo theo ID
 *     tags: [Reports]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của báo cáo
 *     responses:
 *       200:
 *         description: Báo cáo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Report'
 *       404:
 *         description: Không tìm thấy báo cáo
 *       500:
 *         description: Lỗi server
 */
router.get('/:id', reportController.getReportById);

/**
 * @swagger
 * /api/report/create:
 *   post:
 *     summary: Tạo báo cáo mới
 *     tags: [Reports]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Report'
 *     responses:
 *       201:
 *         description: Báo cáo đã được tạo thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Report'
 *       400:
 *         description: Lỗi yêu cầu không hợp lệ
 *       500:
 *         description: Lỗi server
 */
router.post('/create', reportController.createReport);

/**
 * @swagger
 * /api/report/update/{id}:
 *   put:
 *     summary: Cập nhật báo cáo
 *     tags: [Reports]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của báo cáo
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Report'
 *     responses:
 *       200:
 *         description: Báo cáo đã được cập nhật thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Report'
 *       404:
 *         description: Không tìm thấy báo cáo
 *       500:
 *         description: Lỗi server
 */
router.put('/update/:id', reportController.updateReport);

/**
 * @swagger
 * /api/report/{id}/status/processing:
 *   patch:
 *     summary: Cập nhật trạng thái báo cáo thành "Processing"
 *     tags: [Reports]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của báo cáo
 *     responses:
 *       200:
 *         description: Trạng thái báo cáo đã được cập nhật thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Report'
 *       404:
 *         description: Không tìm thấy báo cáo
 *       500:
 *         description: Lỗi server
 */
router.patch('/:id/status/processing', auth(['Admin']),reportController.updateReportStatusToProcessing);

/**
 * @swagger
 * /api/report/{id}/status/resolved:
 *   patch:
 *     summary: Cập nhật trạng thái báo cáo thành "Resolved"
 *     tags: [Reports]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của báo cáo
 *     responses:
 *       200:
 *         description: Trạng thái báo cáo đã được cập nhật thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Report'
 *       404:
 *         description: Không tìm thấy báo cáo
 *       500:
 *         description: Lỗi server
 */
router.patch('/:id/status/resolved',auth(['Admin']), reportController.updateReportStatusToResolved);

/**
 * @swagger
 * /api/report/delete/{id}:
 *   delete:
 *     summary: Xóa báo cáo
 *     tags: [Reports]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của báo cáo
 *     responses:
 *       200:
 *         description: Báo cáo đã được xóa
 *       404:
 *         description: Không tìm thấy báo cáo
 *       500:
 *         description: Lỗi server
 */
router.delete('/delete/:id', reportController.deleteReport);

module.exports = router;