const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');

/**
 * @swagger
 * components:
 *   schemas:
 *     Post:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - price
 *         - location
 *         - type
 *         - features
 *         - image_url
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the post
 *         title:
 *           type: string
 *           description: The title of the post
 *         description:
 *           type: string
 *           description: The description of the post
 *         price:
 *           type: number
 *           description: The price of the post
 *         location:
 *           type: string
 *           description: The location of the post
 *         type:
 *           type: string
 *           description: The type of the post
 *         features:
 *           type: string
 *           description: The features of the post
 *         image_url:
 *           type: string
 *           description: The URL of the post image
 *         create_at:
 *           type: string
 *           format: date-time
 *           description: The date and time the post was created
 *         update_at:
 *           type: string
 *           format: date-time
 *           description: The date and time the post was last updated
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
 *             $ref: '#/components/schemas/Post'
 *     responses:
 *       201:
 *         description: The post was successfully created
 *       400:
 *         description: Bad request
 */
router.post('/create', postController.createPost);

/**
 * @swagger
 * /api/post/getAll:
 *   get:
 *     summary: Trả về danh sách all post
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
 */
router.get('/getAll', postController.getAllPosts);

/**
 * @swagger
 * /api/post/search:
 *   get:
 *     summary: Tìm kiếm post
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
 *         name: type
 *         schema:
 *           type: string
 *         description: The type of the post
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
 *         description: The list of the posts that match the search criteria
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 */
router.get('/search', postController.searchPosts);

/**
 * @swagger
 * /api/post/{id}:
 *   get:
 *     summary: Lấy post theo id
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The post ID
 *     responses:
 *       200:
 *         description: The post description by ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       404:
 *         description: The post was not found
 */
router.get('/:id', postController.getPostById);

/**
 * @swagger
 * /api/post/{id}:
 *   put:
 *     summary: Cập nhật post
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The post ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Post'
 *     responses:
 *       200:
 *         description: The post was updated
 *       404:
 *         description: The post was not found
 */
router.put('/:id', postController.updatePost);

/**
 * @swagger
 * /api/post/{id}:
 *   delete:
 *     summary: Xóa post theo id
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The post ID
 *     responses:
 *       200:
 *         description: The post was deleted
 *       404:
 *         description: The post was not found
 */
router.delete('/:id', postController.deletePost);

module.exports = router;
