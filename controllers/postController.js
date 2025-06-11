const mongoose = require("mongoose");
const Post = require("../models/Post");
const UserPackage = require("../models/UserPackage");
const { cloudinary } = require('../config/cloudinaryConfig');
const API_KEY = '9YHLYJH0cPEqnF9yCHOUrY23rEQKZp9v8vUmdQmS';
const axios = require('axios');
const Comment = require('../models/Comment');
const { evaluatePrice } = require('../services/priceService');
const { checkDuplicateImages } = require('../services/imageService');

async function getCoordinatesFromAddress(address) {
  try {
    const encodedAddress = encodeURIComponent(address)
    const response = await axios.get(`https://rsapi.goong.io/geocode?address=${encodedAddress}&api_key=${API_KEY}`);
    console.log(response.data)
    const location = response.data.results[0]?.geometry?.location;

    if (!location) {
      throw new Error('Không tìm thấy tọa độ cho địa chỉ này');
    }

    return { lat: location.lat, lon: location.lng };
  } catch (error) {
    console.error('Lỗi khi gọi GoongMap API:', error, address);
    throw new Error('Không thể lấy tọa độ từ địa chỉ');
  }
}

exports.createPost = async (req, res) => {
  try {
    console.log(req.body)
    const { title, description, price, location, landlord, roomType, size, amenities, additionalCosts } = req.body;

    const parsedLocation = JSON.parse(location);


    const address = `${parsedLocation.address}, ${parsedLocation.ward}, ${parsedLocation.district}, ${parsedLocation.city}, Việt Nam`;

    const { lat, lon } = await getCoordinatesFromAddress(address);
    const parsedAmenities = JSON.parse(amenities);
    const parsedAdditionalCosts = JSON.parse(additionalCosts);

    const parsedPrice = parseInt(price) || 0;
    const parsedSize = parseInt(size) || 0;

    const images = req.files.images ? req.files.images.map(file => ({
      url: file.path,
      public_id: file.filename
    })) : [];

    const videos = req.files.videos ? req.files.videos.map(file => ({
      url: file.path,
      public_id: file.filename
    })) : [];

    let imageCheckResult = { hasDuplicates: false, duplicateDetails: [] };
    if (req.files?.images?.length > 0) {
      const imageCheck = await checkDuplicateImages(req.files.images);
      if (imageCheck.success && imageCheck.data.results) {
        imageCheckResult.hasDuplicates = imageCheck.data.results.some(r => r.duplicate);
        imageCheckResult.duplicateDetails = imageCheck.data.results
          .filter(r => r.duplicate)
          .map(r => ({
            url: r.filename,
            matchedWith: r.matched_with,
            matchedPostId: r.post_id
          }));
      }
    }

    let priceEvaluationResult = {};
    const priceCheck = await evaluatePrice(
      parsedSize,
      parsedLocation.district,
      parsedLocation.city,
      parsedPrice
    );
    
    if (priceCheck.success) {
      priceEvaluationResult = {
        evaluation: priceCheck.data.price_evaluation,
        level: priceCheck.data.evaluation_level,
        predictedPrice: priceCheck.data.predicted_price,
        priceDifference: priceCheck.data.price_difference,
        pricePercentage: priceCheck.data.price_percentage,
        districtStats: {
          meanPrice: priceCheck.data.district_stats.mean_price,
          minPrice: priceCheck.data.district_stats.min_price,
          maxPrice: priceCheck.data.district_stats.max_price
        }
      };
    }

    const warnings = [];
    if (imageCheckResult.hasDuplicates) {
      warnings.push('Bài đăng chứa ảnh trùng lặp với bài đăng khác');
    }
    if (priceEvaluationResult.level === 'high') {
      warnings.push('Giá thuê cao hơn mức trung bình khu vực');
    } else if (priceEvaluationResult.level === 'low') {
      warnings.push('Giá thuê thấp hơn mức trung bình khu vực');
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Tạo bài đăng mới
      const newPost = new Post({
        title,
        description,
        price,
        location: {
          address: parsedLocation.address,
          city: parsedLocation.city,
          district: parsedLocation.district,
          ward: parsedLocation.ward,
          geoLocation: {
            type: 'Point',
            coordinates: [lon, lat]
          }
        },
        landlord,
        roomType,
        size,
        amenities: parsedAmenities,
        additionalCosts: parsedAdditionalCosts,
        images,
        videos,
        userPackage: req.userPackage ? req.userPackage._id : null,
        priceEvaluation: priceEvaluationResult,
        imageCheck: imageCheckResult,
        warnings
      });

      const savedPost = await newPost.save({ session });

      if (req.userPackage) {
        const userPackage = await UserPackage.findById(req.userPackage._id).session(session);
        if (userPackage) {
          userPackage.postsLeft -= 1;
          await userPackage.save({ session });
        }
      }

      // Commit transaction
      await session.commitTransaction();
      session.endSession();

      res.status(201).json({
        success: true,
        message: 'Tạo bài đăng thành công',
        post: savedPost,
        postsRemaining: req.userPackage ? req.userPackage.postsLeft - 1 : 0
      });
    } catch (error) {
      // Abort transaction nếu có lỗi
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
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

    const averageRatingResult = await Comment.aggregate([
      { $match: { house: new mongoose.Types.ObjectId(req.params.id) } }, // Lọc bình luận cho bài đăng
      { $group: { _id: "$house", averageRating: { $avg: "$rating" } } } // Tính trung bình đánh giá
    ]);

    const averageRating = averageRatingResult.length > 0 ? averageRatingResult[0].averageRating.toFixed(1) : 0;

    post.averageRating = averageRating;
    await post.save();

    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.findNearbyPosts = async (req, res) => {
  try {
    const { lat, lon, maxDistance = 5000 } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({ message: 'Vui lòng cung cấp vĩ độ và kinh độ.' });
    }

    const posts = await Post.find({
      'location.geoLocation': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lon), parseFloat(lat)],
          },
          $maxDistance: parseInt(maxDistance),
        },
      },
      status: 'Active',
    }).sort({ createdAt: -1 });

    const postsWithDistance = posts.map(post => {
      const postCoordinates = post.location.geoLocation.coordinates;
      const distance = getDistanceFromLatLonInKm(lat, lon, postCoordinates[1], postCoordinates[0]);
      return {
        ...post.toObject(),
        distance,
      }
    });

    res.status(200).json(postsWithDistance);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi khi tìm kiếm bài đăng.' });
  }
};

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in km
  const dLat = deg2rad(lat2 - lat1);  // Convert to radians
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Calculate the distance
  return distance;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

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
    const query = {
      status: 'Active'
    };

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
    const posts = await Post.find({ roomType: roomType, status: 'Active' });
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy danh sách trọ theo địa chỉ (quận)
exports.getPostsByDistrict = async (req, res) => {
  try {
    const district = req.params.district;
    const posts = await Post.find({ "location.district": district, status: 'Active' });
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
    const latestPosts = await Post.find({ status: 'Active' }).sort({ createdAt: -1 });
    res.status(200).json(latestPosts);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Tăng số lượt xem của bài post
exports.increasePostViews = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }

    post.views += 1;
    await post.save();
    res.status(200).json({ msg: 'Post views increased' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};