const mongoose = require("mongoose");
const Post = require("../models/Post");
const { cloudinary } = require('../config/cloudinaryConfig');
// Tạo bài đăng mới
exports.createPost = async (req, res) => {
  try {
    const { title, description, price, location, landlord, roomType, size, amenities, additionalCosts } = req.body;

    const parsedLocation = JSON.parse(location);
    const parsedAmenities = JSON.parse(amenities);
    const parsedAdditionalCosts = JSON.parse(additionalCosts);

    const images = req.files.images ? req.files.images.map(file => ({
      url: file.path,
      public_id: file.filename
    })) : [];

    const videos = req.files.videos ? req.files.videos.map(file => ({
      url: file.path,
      public_id: file.filename
    })) : [];

    const newPost = new Post({
      title,
      description,
      price,
      location: parsedLocation,
      landlord,
      roomType,
      size,
      amenities: parsedAmenities,
      additionalCosts: parsedAdditionalCosts,
      images,
      videos
    });

    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find().populate("landlord", "username email phone address");
    res.json(posts);
  } catch (err) {
    console.log("Lỗi" + err);
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
  const { id } = req.params;
  const { title, description, price, location, landlord, roomType, size, amenities, additionalCosts } = req.body;

  try {
    let post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }

    // Xử lý các trường dữ liệu cơ bản
    if (title) post.title = title;
    if (description) post.description = description;
    if (price) post.price = price;
    if (landlord) post.landlord = landlord;
    if (roomType) post.roomType = roomType;
    if (size) post.size = size;

    // Xử lý các trường JSON
    if (location) {
      try {
        post.location = JSON.parse(location);
      } catch (error) {
        console.error('Location parsing error:', error);
        return res.status(400).json({ msg: 'Invalid location format' });
      }
    }

    if (amenities) {
      try {
        post.amenities = JSON.parse(amenities);
      } catch (error) {
        console.error('Amenities parsing error:', error);
        return res.status(400).json({ msg: 'Invalid amenities format' });
      }
    }

    if (additionalCosts) {
      try {
        post.additionalCosts = JSON.parse(additionalCosts);
      } catch (error) {
        console.error('Additional costs parsing error:', error);
        return res.status(400).json({ msg: 'Invalid additional costs format' });
      }
    }

    // Xử lý images
    if (req.files && req.files.images) {
      try {
        const newImages = req.files.images.map(file => ({
          url: file.path,
          public_id: file.filename
        }));
        post.images = [...post.images, ...newImages];
      } catch (error) {
        console.error('Image processing error:', error);
        return res.status(400).json({ msg: 'Error processing images' });
      }
    }

    // Xử lý videos
    if (req.files && req.files.videos) {
      try {
        const newVideos = req.files.videos.map(file => ({
          url: file.path,
          public_id: file.filename
        }));
        post.videos = [...post.videos, ...newVideos];
      } catch (error) {
        console.error('Video processing error:', error);
        return res.status(400).json({ msg: 'Error processing videos' });
      }
    }

    const updatedPost = await post.save();
    res.json({
      msg: 'Post updated successfully',
      post: updatedPost
    });

  } catch (err) {
    console.error('Update post error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
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
    const { title, location, district, ward, city, roomType, priceMin, priceMax } = req.query;
    const query = {};

    if (title) query.title = { $regex: title, $options: "i" };
    if (location)
      query["location.address"] = { $regex: location, $options: "i" };
    if (district) query["location.district"] = { $regex: district, $options: "i" };
    if (ward) query["location.ward"] = { $regex: ward, $options: "i" };
    if (city) query["location.city"] = { $regex: city, $options: "i" };
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

// Lấy danh sách các bài đăng đang hoạt động
exports.getActivePosts = async (req, res) => {
  try {
    const activePosts = await Post.find({ status: 'Active' });
    res.status(200).json(activePosts);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Lấy danh sách các bài đăng đang chờ duyệt
exports.getPendingPosts = async (req, res) => {
  try {
    const activePosts = await Post.find({ status: 'Pending' });
    res.status(200).json(activePosts);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Lấy danh sách các bài đăng đã bị xoá mềm
exports.getSoftDeletedPosts = async (req, res) => {
  try {
    const activePosts = await Post.find({ status: 'Deleted' });
    res.status(200).json(activePosts);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Chuyển trạng thái bài viết thành "Active"
exports.activatePost = async (req, res) => {
  const { postId } = req.params;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }

    post.status = 'Active';
    await post.save();

    res.status(200).json({ msg: 'Post status updated to Active', post });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Chuyển trạng thái bài viết thành "Deleted"
exports.softDeletePost = async (req, res) => {
  const { postId } = req.params;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }

    post.status = 'Deleted';
    await post.save();

    res.status(200).json({ msg: 'Post status updated to Deleted', post });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.blockedPost = async (req, res) => {
  const { postId } = req.params;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }

    post.status = 'Locked';
    await post.save();

    res.status(200).json({ msg: 'Post status updated to Locked', post });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

//Lấy bài post theo id của chủ nhà
exports.getPostsByLandlordId = async (req, res) => {
  try {
    const posts = await Post.find({ landlord: req.params.landlordId });
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy danh sách các bài post mới nhất
exports.getLatestPosts = async (req, res) => {
  try {
    const latestPosts = await Post.find().sort({ createdAt: -1 });
    res.status(200).json(latestPosts);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};