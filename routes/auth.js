const express = require("express");
const {
  register,
  login,
  getUserInfo,
  verifyOTP,
  forgotPassword,
  resetPassword,
  updateUser,
  getUserById,
  updateUserRoleToRenter,
  getAllUsers, 
  deleteUserById,
  adminCreateUser,
  sendOtpSMS,
  verifyOtpSMS,
  googleLogin,
  followUser,
  unfollowUser,
  getUserProfile
} = require("../controllers/authController");
const auth = require("../middleware/auth");

const router = express.Router();

const { upload } = require('../config/cloudinaryConfig');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: API quản lý xác thực
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - username
 *         - password
 *         - email
 *         - phone
 *         - address
 *       properties:
 *         username:
 *           type: string
 *           description: The user's username
 *         email:
 *           type: string
 *           description: The user's email
 *         password:
 *           type: string
 *           description: The user's password
 *         phone:
 *           type: string
 *           description: The user's phone number
 *         address:
 *           type: string
 *           description: The user's address
 *         avatar:
 *           type: object
 *           properties:
 *             url:
 *               type: string
 *               description: URL of the user's avatar
 *             public_id:
 *               type: string
 *               description: Public ID of the user's avatar
 *           description: The user's avatar
 */

/**
 * @swagger
 * /api/auth/google:
 *   post:
 *     summary: Đăng nhập bằng Google
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tokenId
 *             properties:
 *               tokenId:
 *                 type: string
 *                 description: Google OAuth token ID
 *     responses:
 *       200:
 *         description: Đăng nhập thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 token:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Token không hợp lệ
 *       500:
 *         description: Lỗi server
 */
router.post('/google', googleLogin);

/**
 * @swagger
 * /api/auth/users/{userId}/follow:
 *   post:
 *     summary: Theo dõi người dùng
 *     description: API cho phép người dùng hiện tại theo dõi một người dùng khác
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của người dùng cần theo dõi
 *     responses:
 *       200:
 *         description: Theo dõi thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Followed successfully
 *       400:
 *         description: Đã theo dõi người dùng này rồi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Already following this user
 *       404:
 *         description: Không tìm thấy người dùng
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: User not found
 *       500:
 *         description: Lỗi server
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Internal server error
 */
router.post('/users/:userId/follow', auth(['User', 'Renter']) ,followUser);

/**
 * @swagger
 * /api/auth/users/{userId}/unfollow:
 *   post:
 *     summary: Hủy theo dõi người dùng
 *     description: API cho phép người dùng hiện tại hủy theo dõi một người dùng khác
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của người dùng muốn hủy theo dõi
 *     responses:
 *       200:
 *         description: Hủy theo dõi thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unfollowed successfully
 *       400:
 *         description: Chưa theo dõi người dùng này
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Not following this user
 *       404:
 *         description: Không tìm thấy người dùng
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: User not found
 *       500:
 *         description: Lỗi server
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Internal server error
 */
router.post('/users/:userId/unfollow',auth(['User', 'Renter']), unfollowUser);

/**
 * @swagger
 * /api/auth/users/{userId}/profile:
 *   get:
 *     summary: Lấy thông tin profile của người dùng
 *     description: API lấy thông tin chi tiết profile của người dùng bao gồm trạng thái theo dõi
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của người dùng cần xem profile
 *     responses:
 *       200:
 *         description: Thông tin profile người dùng
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 profile:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 60d0fe4f5311236168a109ca
 *                     username:
 *                       type: string
 *                       example: johndoe
 *                     email:
 *                       type: string
 *                       example: john@example.com
 *                     user_role:
 *                       type: string
 *                       example: User
 *                     phone:
 *                       type: string
 *                       example: "0123456789"
 *                     address:
 *                       type: string
 *                       example: "123 Street, City"
 *                     avatar:
 *                       type: object
 *                       properties:
 *                         url:
 *                           type: string
 *                           example: https://cloudinary.com/image.jpg
 *                         public_id:
 *                           type: string
 *                           example: user_avatars/abc123
 *                     followers:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           username:
 *                             type: string
 *                           avatar:
 *                             type: object
 *                             properties:
 *                               url:
 *                                 type: string
 *                     following:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           username:
 *                             type: string
 *                           avatar:
 *                             type: object
 *                             properties:
 *                               url:
 *                                 type: string
 *                     followStatus:
 *                       type: object
 *                       properties:
 *                         isFollowing:
 *                           type: boolean
 *                           description: Người dùng hiện tại có đang theo dõi profile này không
 *                           example: true
 *                         isFollower:
 *                           type: boolean
 *                           description: Người dùng của profile này có đang theo dõi người dùng hiện tại không
 *                           example: false
 *       400:
 *         description: ID người dùng không hợp lệ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Invalid user ID format
 *       404:
 *         description: Không tìm thấy người dùng
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: User not found
 *       500:
 *         description: Lỗi server
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Internal server error
 */
router.get('/users/:userId/profile', auth(['User', 'Renter']), getUserProfile);

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Đăng ký người dùng mới
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: Đăng ký thành công
 *       400:
 *         description: Thông tin đăng ký không hợp lệ
 */
router.post("/register", register);

/**
 * @swagger
 * /api/auth/users/{id}:
 *   put:
 *     summary: Cập nhật thông tin người dùng
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của người dùng
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: The user's username
 *               email:
 *                 type: string
 *                 description: The user's email
 *               password:
 *                 type: string
 *                 description: The user's password
 *               phone:
 *                 type: string
 *                 description: The user's phone number
 *               address:
 *                 type: string
 *                 description: The user's address
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 description: The user's avatar
 *     responses:
 *       200:
 *         description: Thông tin người dùng đã được cập nhật
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Lỗi yêu cầu không hợp lệ
 *       404:
 *         description: Không tìm thấy người dùng
 *       500:
 *         description: Lỗi server
 */
router.put('/users/:id', upload.single('avatar'), updateUser);

/**
 * @swagger
 * /api/auth/update-role-to-renter/{userId}:
 *   put:
 *     summary: Cập nhật role của người dùng thành Renter
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của người dùng
 *     responses:
 *       200:
 *         description: Role của người dùng đã được cập nhật thành Renter
 *       404:
 *         description: Không tìm thấy người dùng
 *       500:
 *         description: Lỗi server
 */
router.put('/update-role-to-renter/:userId', updateUserRoleToRenter);

/**
 * @swagger
 * /api/auth/verify-otp:
 *   post:
 *     summary: Xác thực OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *       400:
 *         description: Invalid OTP or user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 */
router.post("/verify-otp", verifyOTP);

/**
 * @swagger
 * /api/auth/send-otp-sms:
 *   post:
 *     summary: Gửi mã OTP qua SMS
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 description: Số điện thoại của người dùng
 *                 example: "+84364745239"
 *     responses:
 *       200:
 *         description: Gửi OTP thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Gửi OTP thành công"
 *       400:
 *         description: Số điện thoại là bắt buộc
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Số điện thoại là bắt buộc"
 *       500:
 *         description: Có lỗi xảy ra
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Có lỗi xảy ra"
 *                 error:
 *                   type: string
 *                   example: "Error message"
 */
router.post('/send-otp-sms', sendOtpSMS);

/**
 * @swagger
 * /api/auth/verify-otp-sms:
 *   post:
 *     summary: Xác thực mã OTP qua SMS
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 description: Số điện thoại của người dùng
 *                 example: "+84364745239"
 *               otp:
 *                 type: string
 *                 description: Mã OTP
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Xác thực thành công, role đã được cập nhật
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Xác thực thành công, role đã được cập nhật"
 *       400:
 *         description: Số điện thoại và OTP là bắt buộc hoặc OTP không hợp lệ hoặc đã hết hạn
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Số điện thoại và OTP là bắt buộc"
 *       500:
 *         description: Có lỗi xảy ra
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Có lỗi xảy ra"
 *                 error:
 *                   type: string
 *                   example: "Error message"
 */
router.post('/verify-otp-sms', verifyOtpSMS);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Đăng nhập và lấy token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Đăng nhập thành công và trả về token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       400:
 *         description: Yêu cầu không hợp lệ
 */
router.post("/login", login);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Quên mật khẩu và gửi OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP sent to email. Please verify.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                 email:
 *                   type: string
 *       400:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.post("/forgot-password", forgotPassword);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Đặt lại mật khẩu
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               otp:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *       400:
 *         description: Invalid OTP or user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 */
router.post("/reset-password", resetPassword);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Lấy thông tin người dùng hiện tại
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thông tin người dùng hiện tại
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Không có quyền truy cập
 */
router.get("/me", auth(['Admin','User','Renter']), getUserInfo);

/**
 * @swagger
 * /api/auth/user/{id}:
 *   get:
 *     summary: Lấy thông tin người dùng theo ID
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của người dùng
 *     responses:
 *       200:
 *         description: Thông tin người dùng
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: Không tìm thấy người dùng
 *       500:
 *         description: Lỗi máy chủ
 */
router.get('/user/:id', getUserById);

/**
 * @swagger
 * /api/auth/users:
 *   get:
 *     summary: Lấy danh sách người dùng
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Danh sách người dùng
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       500:
 *         description: Lỗi server
 */
router.get('/users', auth(['Admin']),getAllUsers);

/**
 * @swagger
 * /api/auth/user/{userId}:
 *   delete:
 *     summary: Xóa người dùng theo ID
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của người dùng
 *     responses:
 *       200:
 *         description: Người dùng đã được xóa thành công
 *       404:
 *         description: Không tìm thấy người dùng
 *       500:
 *         description: Lỗi server
 */
router.delete('/user/:userId', auth(['Admin']),deleteUserById);

/**
 * @swagger
 * /api/auth/admin/create-user:
 *   post:
 *     summary: Admin tạo người dùng mới
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: Tên người dùng
 *               password:
 *                 type: string
 *                 description: Mật khẩu
 *               email:
 *                 type: string
 *                 description: Email
 *               phone:
 *                 type: string
 *                 description: Số điện thoại
 *               address:
 *                 type: string
 *                 description: Địa chỉ
 *               user_role:
 *                 type: string
 *                 enum: ['Admin', 'User', 'Renter']
 *                 description: Vai trò người dùng
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 description: Ảnh đại diện
 *     responses:
 *       201:
 *         description: Người dùng đã được tạo thành công
 *       400:
 *         description: Người dùng đã tồn tại
 *       500:
 *         description: Lỗi server
 */
router.post('/admin/create-user', auth(['Admin']), upload.single('avatar'), adminCreateUser);

module.exports = router;
