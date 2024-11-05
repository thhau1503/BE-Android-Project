const Comment = require('../models/Comment');

// Tạo bình luận mới
exports.createComment = async (req, res) => {
    try {
        const newComment = new Comment(req.body);
        const savedComment = await newComment.save();
        res.status(201).json(savedComment);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Lấy tất cả bình luận
exports.getAllComments = async (req, res) => {
    try {
        const comments = await Comment.find().populate('user house');
        res.status(200).json(comments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Lấy bình luận theo ID
exports.getCommentById = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id).populate('user house');
        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }
        res.status(200).json(comment);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Lấy bình luận theo ID bài đăng
exports.getCommentsByPostId = async (req, res) => {
    try {
        const comments = await Comment.find({ house: req.params.postId }).populate('user house');
        res.status(200).json(comments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Cập nhật bình luận theo ID
exports.updateCommentById = async (req, res) => {
    try {
        const updatedComment = await Comment.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedComment) {
            return res.status(404).json({ error: 'Comment not found' });
        }
        res.status(200).json(updatedComment);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Xóa bình luận theo ID
exports.deleteCommentById = async (req, res) => {
    try {
        const deletedComment = await Comment.findByIdAndDelete(req.params.id);
        if (!deletedComment) {
            return res.status(404).json({ error: 'Comment not found' });
        }
        res.status(200).json({ message: 'Comment deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};