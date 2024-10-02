const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');

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
 *         - geoLocation
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
 *           description: Phường/Xã (không bắt buộc)
 *         geoLocation:
 *           type: object
 *           properties:
 *             latitude:
 *               type: number
 *               description: Vĩ độ
 *             longitude:
 *               type: number
 *               description: Kinh độ
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
 *             type: string
 *           description: Danh sách ảnh
 *         videos:
 *           type: array
 *           items:
 *             type: string
 *           description: Danh sách video (nếu có)
 *         averageRating:
 *           type: number
 *           description: Điểm đánh giá trung bình
 *         views:
 *           type: number
 *           description: Số lượt xem
 *         status:
 *           type: string
 *           enum: ['Active', 'Inactive', 'Deleted']
 *           description: Trạng thái của bài viết
 */

/**
 * @swagger
 * /api/post/create:
 *   post:
 *     summary: Tạo một post mới
 *     tags: [Posts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               location:
 *                 $ref: '#/components/schemas/Location'
 *               landlord:
 *                 type: string
 *                 description: The landlord id
 *               roomType:
 *                 type: string
 *                 enum: [Single, Shared, Apartment, Dormitory]
 *               size:
 *                 type: number
 *               availability:
 *                 type: boolean
 *               amenities:
 *                 $ref: '#/components/schemas/Amenity'
 *               additionalCosts:
 *                 $ref: '#/components/schemas/AdditionalCost'
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *               videos:
 *                 type: array
 *                 items:
 *                   type: string
 *               averageRating:
 *                 type: number
 *               views:
 *                 type: number
 *               status:
 *                 type: string
 *                 enum: [Active, Inactive, Deleted]
 *     responses:
 *       201:
 *         description: The post was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       400:
 *         description: Bad request
 */
router.post('/create', postController.createPost);

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
 *     summary: Cập nhật thông tin bài viết theo id
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The post id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Post'
 *     responses:
 *       200:
 *         description: The post was updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       400:
 *         description: Bad request
 *       404:
 *         description: The post was not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', postController.updatePost);

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
 * /api/posts/district/{district}:
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