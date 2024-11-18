const express = require('express');
const router = express.Router();
const auth = require("../middleware/auth");
const postController = require('../controllers/postController');
const { upload } = require('../config/cloudinaryConfig');
/**
 * @swagger
 * tags:
 *   name: Posts
 *   description: API quản lý bài đăng
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Location:
 *       type: object
 *       required:
 *         - address
 *         - city
 *         - district
 *         - ward
 *       properties:
 *         address:
 *           type: string
 *           description: Địa chỉ chi tiết
 *         city:
 *           type: string
 *           description: Thành phố
 *         district:
 *           type: string
 *           description: Quận/Huyện
 *         ward:
 *           type: string
 *           description: Phường/Xã 
 *     Amenity:
 *       type: object
 *       properties:
 *         wifi:
 *           type: boolean
 *           description: Có wifi hay không
 *         airConditioner:
 *           type: boolean
 *           description: Có điều hòa hay không
 *         heater:
 *           type: boolean
 *           description: Có máy sưởi hay không
 *         kitchen:
 *           type: boolean
 *           description: Có bếp hay không
 *         parking:
 *           type: boolean
 *           description: Có chỗ đỗ xe hay không
 *     AdditionalCost:
 *       type: object
 *       properties:
 *         electricity:
 *           type: number
 *           description: Chi phí điện
 *         water:
 *           type: number
 *           description: Chi phí nước
 *         internet:
 *           type: number
 *           description: Chi phí internet
 *         cleaning:
 *           type: number
 *           description: Chi phí dọn dẹp
 *         security:
 *           type: number
 *           description: Chi phí bảo vệ
 *     Post:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - price
 *         - location
 *         - landlord
 *         - roomType
 *         - size
 *         - images
 *         - videos
 *       properties:
 *         title:
 *           type: string
 *           description: Tiêu đề bài viết
 *         description:
 *           type: string
 *           description: Mô tả chi tiết
 *         price:
 *           type: number
 *           description: Giá thuê
 *         location:
 *           $ref: '#/components/schemas/Location'
 *         landlord:
 *           type: string
 *           description: ID của người cho thuê
 *         roomType:
 *           type: string
 *           enum: ['Single', 'Shared', 'Apartment', 'Dormitory']
 *           description: Loại phòng
 *         size:
 *           type: number
 *           description: Diện tích phòng (m2)
 *         availability:
 *           type: boolean
 *           description: Tình trạng còn trống hay đã thuê
 *         amenities:
 *           $ref: '#/components/schemas/Amenity'
 *         additionalCosts:
 *           $ref: '#/components/schemas/AdditionalCost'
 *         images:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               url:
 *                 type: string
 *                 description: URL của ảnh
 *               public_id:
 *                 type: string
 *                 description: Public ID của ảnh
 *           description: Danh sách ảnh
 *         videos:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               url:
 *                 type: string
 *                 description: URL của video
 *               public_id:
 *                 type: string
 *                 description: Public ID của video
 *           description: Danh sách video
 *         averageRating:
 *           type: number
 *           description: Điểm đánh giá trung bình
 *         views:
 *           type: number
 *           description: Số lượt xem
 *         status:
 *           type: string
 *           enum: ['Pending','Active', 'Inactive', 'Deleted', 'Locked']
 *           description: Trạng thái của bài viết
 */

/**
 * @swagger
 * /api/post/create:
 *   post:
 *     summary: Tạo bài đăng mới
 *     tags: [Posts]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Tiêu đề bài đăng
 *               description:
 *                 type: string
 *                 description: Mô tả chi tiết
 *               price:
 *                 type: number
 *                 description: Giá thuê
 *               location:
 *                 type: object
 *                 description: Địa điểm
 *               landlord:
 *                 type: string
 *                 description: ID của người cho thuê
 *               roomType:
 *                 type: string
 *                 enum: ['Single', 'Double', 'Shared', 'Apartment', 'Dormitory']
 *                 description: Loại phòng
 *               size:
 *                 type: number
 *                 description: Diện tích phòng (m2)
 *               availability:
 *                 type: boolean
 *                 description: Tình trạng còn trống hay đã thuê
 *               amenities:
 *                 type: object
 *                 description: Tiện nghi
 *               additionalCosts:
 *                 type: object
 *                 description: Chi phí bổ sung
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                   description: Danh sách ảnh
 *               videos:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                   description: Danh sách video
 *     responses:
 *       201:
 *         description: Bài đăng đã được tạo thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       400:
 *         description: Lỗi yêu cầu không hợp lệ
 *       500:
 *         description: Lỗi server
 */
router.post('/create', upload.fields([{ name: 'images', maxCount: 10 }, { name: 'videos', maxCount: 5 }]), postController.createPost);

/**
 * @swagger
 * /api/post/landlord/{landlordId}:
 *   get:
 *     summary: Lấy danh sách bài đăng theo ID của chủ nhà
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: landlordId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của chủ nhà
 *     responses:
 *       200:
 *         description: Danh sách bài đăng
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 *       500:
 *         description: Lỗi server
 */
router.get('/landlord/:landlordId', postController.getPostsByLandlordId);

/**
 * @swagger
 * /api/post/getPendingPost:
 *   get:
 *     summary: Lấy các bài đăng có trạng thái "Pending"
 *     tags: [Posts]
 *     responses:
 *       200:
 *         description: Danh sách các bài đăng có trạng thái "Pending"
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 *       500:
 *         description: Lỗi server
 */
router.get('/getPendingPost',auth(['Admin']), postController.getPendingPosts);

/**
 * @swagger
 * /api/post/getActivePost:
 *   get:
 *     summary: Lấy các bài đăng có trạng thái "Active"
 *     tags: [Posts]
 *     responses:
 *       200:
 *         description: Danh sách các bài đăng có trạng thái "Active"
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 *       500:
 *         description: Lỗi server
 */
router.get('/getActivePost', postController.getActivePosts);

/**
 * @swagger
 * /api/post/getDeletedPost:
 *   get:
 *     summary: Lấy các bài đăng có trạng thái "Deleted"
 *     tags: [Posts]
 *     responses:
 *       200:
 *         description: Danh sách các bài đăng có trạng thái "Deleted"
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 *       500:
 *         description: Lỗi server
 */
router.get('/getDeletedPost',auth(['Admin']), postController.getSoftDeletedPosts);

/**
 * @swagger
 * /api/post/{postId}/activate:
 *   put:
 *     summary: Chuyển trạng thái bài viết thành "Active"
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của bài viết
 *     responses:
 *       200:
 *         description: Trạng thái bài viết đã được cập nhật thành "Active"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       404:
 *         description: Không tìm thấy bài viết
 *       500:
 *         description: Lỗi server
 */
router.put('/:postId/activate', auth(['Admin']), postController.activatePost);

/**
 * @swagger
 * /api/post/{postId}/delete:
 *   put:
 *     summary: Chuyển trạng thái bài viết thành "Deleted"
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của bài viết
 *     responses:
 *       200:
 *         description: Trạng thái bài viết đã được cập nhật thành "Deleted"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       404:
 *         description: Không tìm thấy bài viết
 *       500:
 *         description: Lỗi server
 */
router.put('/:postId/delete',auth(['Admin']), postController.softDeletePost);

/**
 * @swagger
 * /api/post/{postId}/lock:
 *   put:
 *     summary: Chuyển trạng thái bài viết thành "Lock (sau khi đã có người đặt cọc)"
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của bài viết
 *     responses:
 *       200:
 *         description: Trạng thái bài viết đã được cập nhật thành "Lock"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       404:
 *         description: Không tìm thấy bài viết
 *       500:
 *         description: Lỗi server
 */
router.put('/:postId/lock', auth(['Renter']), postController.blockedPost);

/**
 * @swagger
 * /api/post/top-views:
 *   get:
 *     summary: Lấy ra 10 bài post có nhiều lượt xem nhất
 *     tags: [Posts]
 *     responses:
 *       200:
 *         description: Danh sách 10 bài post có nhiều lượt xem nhất
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 *       500:
 *         description: Lỗi máy chủ
 */
router.get('/top-views', postController.getTopPostsByViews);

/**
 * @swagger
 * /api/post/districts:
 *   get:
 *     summary: Lấy danh sách các quận từ các bài đăng
 *     tags: [Posts]
 *     responses:
 *       200:
 *         description: Danh sách các quận
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *       500:
 *         description: Lỗi máy chủ
 */
router.get('/districts', postController.getDistricts);

/**
 * @swagger
 * /api/post/get-room-types:
 *   get:
 *     summary: Lấy danh sách các loại phòng từ các bài đăng
 *     tags: [Posts]
 *     responses:
 *       200:
 *         description: Danh sách các loại phòng
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *       500:
 *         description: Lỗi máy chủ
 */
router.get('/get-room-types', postController.getRoomTypes);

/**
 * @swagger
 * /api/post/getAll:
 *   get:
 *     summary: Lấy danh sách tất cả bài viết
 *     tags: [Posts]
 *     responses:
 *       200:
 *         description: The list of the posts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 *       500:
 *         description: Internal server error
 */
router.get('/getAll', postController.getAllPosts);

/**
 * @swagger
 * /api/post/search:
 *   get:
 *     summary: Tìm kiếm bài viết theo các tiêu chí
 *     tags: [Posts]
 *     parameters:
 *       - in: query
 *         name: title
 *         schema:
 *           type: string
 *         description: The title of the post
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: The location of the post
 *       - in: query
 *         name: roomType
 *         schema:
 *           type: string
 *         description: The type of the room
 *       - in: query
 *         name: priceMin
 *         schema:
 *           type: number
 *         description: The minimum price
 *       - in: query
 *         name: priceMax
 *         schema:
 *           type: number
 *         description: The maximum price
 *     responses:
 *       200:
 *         description: The list of the posts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 *       500:
 *         description: Internal server error
 */
router.get('/search', postController.searchPosts);

/**
 * @swagger
 * /api/post/{id}:
 *   get:
 *     summary: Lấy thông tin bài viết theo id
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The post id
 *     responses:
 *       200:
 *         description: The post description by id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       404:
 *         description: The post was not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', postController.getPostById);

/**
 * @swagger
 * /api/post/{id}:
 *   put:
 *     summary: Cập nhật bài đăng
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của bài đăng
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Tiêu đề bài đăng
 *               description:
 *                 type: string
 *                 description: Mô tả chi tiết
 *               price:
 *                 type: number
 *                 description: Giá thuê
 *               location:
 *                 type: object
 *                 description: Địa điểm
 *               landlord:
 *                 type: string
 *                 description: ID của người cho thuê
 *               roomType:
 *                 type: string
 *                 enum: ['Single', 'Double', 'Shared', 'Apartment', 'Dormitory']
 *                 description: Loại phòng
 *               size:
 *                 type: number
 *                 description: Diện tích phòng (m2)
 *               availability:
 *                 type: boolean
 *                 description: Tình trạng còn trống hay đã thuê
 *               amenities:
 *                 type: object
 *                 description: Tiện nghi
 *               additionalCosts:
 *                 type: object
 *                 description: Chi phí bổ sung
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                   description: Danh sách ảnh
 *               videos:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                   description: Danh sách video
 *     responses:
 *       200:
 *         description: Bài đăng đã được cập nhật thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       400:
 *         description: Lỗi yêu cầu không hợp lệ
 *       404:
 *         description: Không tìm thấy bài đăng
 *       500:
 *         description: Lỗi server
 */
router.put('/:id', upload.fields([{ name: 'images', maxCount: 10 }, { name: 'videos', maxCount: 5 }]), postController.updatePost);

/**
 * @swagger
 * /api/post/{id}:
 *   delete:
 *     summary: Xóa bài viết theo id
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The post id
 *     responses:
 *       200:
 *         description: The post was deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       404:
 *         description: The post was not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', postController.deletePost);

/**
 * @swagger
 * /api/post/room-type/{roomType}:
 *   get:
 *     summary: Lấy danh sách trọ theo thể loại
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: roomType
 *         schema:
 *           type: string
 *         required: true
 *         description: Thể loại phòng (Single, Shared, Apartment, Dormitory)
 *     responses:
 *       200:
 *         description: Danh sách trọ theo thể loại
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 *       500:
 *         description: Lỗi máy chủ
 */
router.get('/room-type/:roomType', postController.getPostsByRoomType);

/**
 * @swagger
 * /api/post/district/{district}:
 *   get:
 *     summary: Lấy danh sách trọ theo địa chỉ (quận)
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: district
 *         schema:
 *           type: string
 *         required: true
 *         description: Tên quận
 *     responses:
 *       200:
 *         description: Danh sách trọ theo địa chỉ (quận)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 *       500:
 *         description: Lỗi máy chủ
 */
router.get('/district/:district', postController.getPostsByDistrict);


module.exports = router;