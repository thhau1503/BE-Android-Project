const express = require('express');
const router = express.Router();
const packageController = require('../controllers/packageController');
const auth = require('../middleware/auth'); 

/**
 * @swagger
 * components:
 *   schemas:
 *     PostPackage:
 *       type: object
 *       required:
 *         - name
 *         - description
 *         - price
 *         - duration
 *         - postLimit
 *       properties:
 *         _id:
 *           type: string
 *           description: ID duy nhất của gói tin
 *         name:
 *           type: string
 *           description: Tên gói tin
 *         description:
 *           type: string
 *           description: Mô tả chi tiết về gói tin
 *         price:
 *           type: number
 *           description: Giá gói tin (VNĐ)
 *         duration:
 *           type: number
 *           description: Thời hạn sử dụng gói tin (ngày)
 *         postLimit:
 *           type: number
 *           description: Số lượng bài đăng được phép trong gói
 *         features:
 *           type: array
 *           items:
 *             type: string
 *           description: Các tính năng bổ sung của gói tin
 *         isActive:
 *           type: boolean
 *           description: Trạng thái hoạt động của gói tin
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     UserPackage:
 *       type: object
 *       properties:
 *         package:
 *           $ref: '#/components/schemas/PostPackage'
 *         postsLeft:
 *           type: number
 *           description: Số lượng bài đăng còn lại
 *         purchasedAt:
 *           type: string
 *           format: date-time
 *           description: Thời điểm mua gói
 *         expiresAt:
 *           type: string
 *           format: date-time
 *           description: Thời điểm hết hạn
 *         isActive:
 *           type: boolean
 *           description: Trạng thái hoạt động
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * tags:
 *   name: Packages
 *   description: API quản lý gói tin và đăng ký
 */

/**
 * @swagger
 * /api/packages/active:
 *   get:
 *     summary: Lấy tất cả gói tin đang hoạt động
 *     tags: [Packages]
 *     responses:
 *       200:
 *         description: Trả về danh sách gói tin đang hoạt động
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PostPackage'
 *       500:
 *         description: Lỗi máy chủ
 */
router.get('/active', packageController.getActivePackages);

/**
 * @swagger
 * /api/packages/current:
 *   get:
 *     summary: Lấy thông tin gói hiện tại của người dùng đã xác thực
 *     tags: [Packages]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Trả về thông tin gói hiện tại
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 hasActivePackage:
 *                   type: boolean
 *                   description: Trạng thái có gói đang hoạt động hay không
 *                 package:
 *                   $ref: '#/components/schemas/PostPackage'
 *                 postsLeft:
 *                   type: number
 *                   description: Số bài đăng còn lại
 *                 purchasedAt:
 *                   type: string
 *                   format: date-time
 *                   description: Thời điểm mua gói
 *                 expiresAt:
 *                   type: string
 *                   format: date-time
 *                   description: Thời điểm hết hạn
 *                 isActive:
 *                   type: boolean
 *                   description: Trạng thái hoạt động
 *       404:
 *         description: Không tìm thấy gói đang hoạt động
 *       500:
 *         description: Lỗi máy chủ
 */
router.get('/current', auth(), packageController.getCurrentPackage);

/**
 * @swagger
 * /api/packages/payment:
 *   post:
 *     summary: Tạo giao dịch thanh toán cho gói
 *     tags: [Packages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - packageId
 *             properties:
 *               packageId:
 *                 type: string
 *                 description: ID của gói cần thanh toán
 *     responses:
 *       200:
 *         description: Tạo thanh toán thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 paymentUrl:
 *                   type: string
 *                   description: URL để chuyển hướng người dùng đến trang thanh toán
 *                 paymentId:
 *                   type: string
 *                   description: ID của giao dịch thanh toán đã tạo
 *       400:
 *         description: Dữ liệu đầu vào không hợp lệ
 *       404:
 *         description: Không tìm thấy gói tin
 *       500:
 *         description: Lỗi máy chủ
 */
router.post('/payment', auth(), packageController.createPayment);

/**
 * @swagger
 * /api/packages/history:
 *   get:
 *     summary: Lấy lịch sử mua gói của người dùng đã xác thực
 *     tags: [Packages]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Trả về lịch sử mua gói thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   package:
 *                     $ref: '#/components/schemas/PostPackage'
 *                   purchasedAt:
 *                     type: string
 *                     format: date-time
 *                     description: Thời điểm mua gói
 *                   expiresAt:
 *                     type: string
 *                     format: date-time
 *                     description: Thời điểm hết hạn
 *                   postsLeft:
 *                     type: number
 *                     description: Số bài đăng còn lại
 *                   isActive:
 *                     type: boolean
 *                     description: Trạng thái hoạt động
 *       500:
 *         description: Lỗi máy chủ
 */
router.get('/history', auth(), packageController.getUserPackageHistory);

/**
 * @swagger
 * /api/packages/verify-payment/{paymentId}:
 *   get:
 *     summary: Kiểm tra trạng thái thanh toán
 *     tags: [Packages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: paymentId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của giao dịch thanh toán cần kiểm tra
 *     responses:
 *       200:
 *         description: Thông tin thanh toán
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [pending, completed, failed]
 *                   description: Trạng thái thanh toán
 *                 package:
 *                   $ref: '#/components/schemas/PostPackage'
 *                 amount:
 *                   type: number
 *                   description: Số tiền thanh toán
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   description: Thời gian tạo giao dịch
 *       404:
 *         description: Không tìm thấy giao dịch thanh toán
 *       500:
 *         description: Lỗi máy chủ
 */
router.get('/verify-payment/:paymentId', auth(), packageController.verifyPayment);

/**
 * @swagger
 * /api/packages/payment-callback:
 *   get:
 *     summary: Endpoint callback cho VNPay sau khi xử lý thanh toán
 *     tags: [Packages]
 *     description: Endpoint này được VNPay gọi sau khi xử lý thanh toán
 *     parameters:
 *       - in: query
 *         name: vnp_TxnRef
 *         schema:
 *           type: string
 *         description: Mã tham chiếu giao dịch
 *       - in: query
 *         name: vnp_ResponseCode
 *         schema:
 *           type: string
 *         description: Mã phản hồi từ VNPay
 *       - in: query
 *         name: vnp_SecureHash
 *         schema:
 *           type: string
 *         description: Chuỗi hash bảo mật để xác minh
 *     responses:
 *       302:
 *         description: Chuyển hướng đến trang kết quả thanh toán
 */
router.get('/payment-callback', packageController.paymentCallback);

/**
 * @swagger
 * /api/packages:
 *   get:
 *     summary: Lấy tất cả các gói tin (chỉ Admin)
 *     tags: [Packages]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách tất cả gói tin
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PostPackage'
 *       403:
 *         description: Không có quyền truy cập
 *       500:
 *         description: Lỗi máy chủ
 */
router.get('/', auth(['Admin']), packageController.getAllPackages);

/**
 * @swagger
 * /api/packages/{id}:
 *   get:
 *     summary: Lấy gói tin theo ID (chỉ Admin)
 *     tags: [Packages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của gói tin
 *     responses:
 *       200:
 *         description: Chi tiết gói tin
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PostPackage'
 *       403:
 *         description: Không có quyền truy cập
 *       404:
 *         description: Không tìm thấy gói tin
 *       500:
 *         description: Lỗi máy chủ
 */
router.get('/:id', auth(['Admin']), packageController.getPackageById);

/**
 * @swagger
 * /api/packages:
 *   post:
 *     summary: Tạo gói tin mới (chỉ Admin)
 *     tags: [Packages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - price
 *               - duration
 *               - postLimit
 *             properties:
 *               name:
 *                 type: string
 *                 description: Tên gói tin
 *               description:
 *                 type: string
 *                 description: Mô tả chi tiết về gói tin
 *               price:
 *                 type: number
 *                 description: Giá gói (VNĐ)
 *               duration:
 *                 type: number
 *                 description: Thời hạn sử dụng (ngày)
 *               postLimit:
 *                 type: number
 *                 description: Số lượng bài đăng được phép
 *               features:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Các tính năng bổ sung
 *     responses:
 *       201:
 *         description: Tạo gói tin thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PostPackage'
 *       400:
 *         description: Dữ liệu đầu vào không hợp lệ
 *       403:
 *         description: Không có quyền truy cập
 *       500:
 *         description: Lỗi máy chủ
 */
router.post('/', auth(['Admin']), packageController.createPackage);

/**
 * @swagger
 * /api/packages/{id}:
 *   put:
 *     summary: Cập nhật gói tin theo ID (chỉ Admin)
 *     tags: [Packages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của gói tin
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Tên gói tin
 *               description:
 *                 type: string
 *                 description: Mô tả chi tiết về gói tin
 *               price:
 *                 type: number
 *                 description: Giá gói (VNĐ)
 *               duration:
 *                 type: number
 *                 description: Thời hạn sử dụng (ngày)
 *               postLimit:
 *                 type: number
 *                 description: Số lượng bài đăng được phép
 *               features:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Các tính năng bổ sung
 *               isActive:
 *                 type: boolean
 *                 description: Trạng thái hoạt động
 *     responses:
 *       200:
 *         description: Cập nhật gói tin thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PostPackage'
 *       403:
 *         description: Không có quyền truy cập
 *       404:
 *         description: Không tìm thấy gói tin
 *       500:
 *         description: Lỗi máy chủ
 */
router.put('/:id', auth(['Admin']), packageController.updatePackage);

/**
 * @swagger
 * /api/packages/{id}:
 *   delete:
 *     summary: Vô hiệu hóa gói tin theo ID (chỉ Admin)
 *     tags: [Packages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của gói tin
 *     responses:
 *       200:
 *         description: Vô hiệu hóa gói tin thành công
 *       403:
 *         description: Không có quyền truy cập
 *       404:
 *         description: Không tìm thấy gói tin
 *       500:
 *         description: Lỗi máy chủ
 */
router.delete('/:id', auth(['Admin']), packageController.deletePackage);

module.exports = router;