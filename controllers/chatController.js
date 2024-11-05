const Chat = require("../models/Chat");

//Tạo đoạn chat mới
exports.createChat = async (req, res) => {
  const { firstUserId, secondUserId } = req.body;
  try {
    const chat = await Chat.findOne({
      members: { $all: [firstUserId, secondUserId] },
    });
    if (chat) {
      return res.status(200).json(chat);
    }
    const newChat = new Chat({
      members: [firstUserId, secondUserId],
    });
    const savedChat = await newChat.save();
    res.status(200).json(savedChat);
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ message: err.message });
  }
};

//Tìm chat của user
exports.getChatByUserId = async (req, res) => {
    const userId = req.params.userId;
    try {
        const chats = await Chat.find({ members: 
            { $in: [userId] }
         });
        res.status(200).json(chats);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

//Tìm đoạn chat giữa 2 user
exports.findChat = async (req, res) => {
    const { firstUserId, secondUserId } = req.params;
    try {
        const chat = await Chat.find({
            members: { $all: [firstUserId, secondUserId] },
        });
        res.status(200).json(chat);
    }
    catch (err) {
        console.log(err.message);
        res.status(500).json({ message: err.message });
    }
};

//Xóa đoạn chat 
exports.deleteChat = async (req, res) => {
    const chatId = req.params.chatId;
    try {
        const chat = await Chat.findByIdAndDelete(chatId);
        res.status(200).json(chat);
    } catch (err) {
        console.log(err.message);
        res.status(500).json({ message: err.message });
    }
};