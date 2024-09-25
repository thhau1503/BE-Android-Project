const mongoose = require('mongoose');
const Post = require('../models/Post');

exports.createPost = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.body.landlord)) {
            return res.status(400).json({ message: 'ID not found' });
        }

        const post = new Post(req.body);
        await post.save();
        res.status(201).json(post);
    } catch (err) {
        console.log(err);
        res.status(400).json({ message: err.message });

    }
};

exports.getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find()
        res.json(posts);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: err.message });
    }
};

exports.getPostById = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });
        res.json(post);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updatePost = async (req, res) => {
    try {
        const post = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!post) return res.status(404).json({ message: 'Post not found' });
        res.json(post);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.deletePost = async (req, res) => {
    try {
        const post = await Post.findByIdAndDelete(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });
        res.json({ message: 'Post deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.searchPosts = async (req, res) => {
    try {
        const { title, location, roomType, priceMin, priceMax } = req.query;
        const query = {};

        if (title) query.title = { $regex: title, $options: 'i' }; 
        if (location) query['location.address'] = { $regex: location, $options: 'i' }; 
        if (roomType) query.roomType = roomType;
        if (priceMin) query.price = { ...query.price, $gte: priceMin };
        if (priceMax) query.price = { ...query.price, $lte: priceMax };

        const posts = await Post.find(query);
        res.json(posts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};