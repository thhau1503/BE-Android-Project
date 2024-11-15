const Favorite = require("../models/Favorite");

// Lấy tất cả các mục yêu thích
exports.getFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.find()
      .populate("id_user_rent")
      .populate("id_post");
    res.status(200).json(favorites);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy một mục yêu thích theo ID
exports.getFavoriteById = async (req, res) => {
  try {
    const favorite = await Favorite.findById(req.params.id);
    if (!favorite)
      return res.status(404).json({ message: "Favorite not found" });
    res.status(200).json(favorite);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy danh mục yêu thích theo ID người dùng hiện đăng nhập
exports.getFavoritesByUserId = async (req, res) => {
  try {
    const favorites = await Favorite.find({ id_user_rent: req.user.id })
    if (!favorites.length)
      return res
        .status(404)
        .json({ message: "No favorites found for this user" });
    res.status(200).json(favorites);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Tạo một mục yêu thích mới
exports.createFavorite = async (req, res) => {
  const favorite = new Favorite({
    id_user_rent: req.body.id_user_rent,
    id_post: req.body.id_post,
  });

  try {
    const newFavorite = await favorite.save();
    res.status(201).json(newFavorite);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Xóa một mục yêu thích
exports.deleteFavorite = async (req, res) => {
  try {
    const favorite = await Favorite.findById(req.params.id);
    if (!favorite)
      return res.status(404).json({ message: "Favorite not found" });

    await favorite.deleteOne({_id : req.params.id});
    res.status(200).json({ message: "Favorite deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getFavoritesByUserIdInput = async (req, res) => {
  try {
    const favorites = await Favorite.find({ id_user_rent: req.params.userId })
    if (!favorites.length)
      return res
        .status(404)
        .json({ message: "No favorites found for this user" });
    res.status(200).json(favorites);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}