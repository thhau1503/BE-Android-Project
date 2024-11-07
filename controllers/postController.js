const mongoose = require("mongoose");
const Post = require("../models/Post");

exports.createPost = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.body.landlord)) {
      return res.status(400).json({ message: "ID not found" });
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
    const posts = await Post.find().populate("landlord", "username email phone address");
    res.json(posts);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};

exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate("landlord", "username email phone address");
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updatePost = async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json(post);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json({ message: "Post deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.searchPosts = async (req, res) => {
  try {
    const { title, location, roomType, priceMin, priceMax } = req.query;
    const query = {};

    if (title) query.title = { $regex: title, $options: "i" };
    if (location)
      query["location.address"] = { $regex: location, $options: "i" };
    if (roomType) query.roomType = roomType;
    if (priceMin) query.price = { ...query.price, $gte: priceMin };
    if (priceMax) query.price = { ...query.price, $lte: priceMax };

    const posts = await Post.find(query);
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lấy ra 10 bài post có nhiều lượt xem nhất
exports.getTopPostsByViews = async (req, res) => {
  try {
    const topPosts = await Post.find().sort({ views: -1 }).limit(10);
    res.status(200).json(topPosts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy danh sách trọ theo thể loại
exports.getPostsByRoomType = async (req, res) => {
  try {
    const roomType = req.params.roomType;
    const posts = await Post.find({ roomType: roomType });
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy danh sách trọ theo địa chỉ (quận)
exports.getPostsByDistrict = async (req, res) => {
  try {
    const district = req.params.district;
    const posts = await Post.find({ "location.district": district });
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy danh sách các quận từ các bài đăng
exports.getDistricts = async (req, res) => {
  try {
    const districts = await Post.distinct("location.district");
    res.status(200).json(districts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy danh sách các loại phòng từ các bài đăng
exports.getRoomTypes = async (req, res) => {
  try {
    const roomTypes = await Post.distinct("roomType");
    res.status(200).json(roomTypes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
