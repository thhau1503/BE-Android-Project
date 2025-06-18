const Chat = require("../models/Chat");
const Message = require("../models/Message");
const mongoose = require("mongoose");

exports.createOrGetChat = async (req, res) => {
  const { firstUserId, secondUserId } = req.body;
  
  if (!mongoose.Types.ObjectId.isValid(firstUserId) || 
      !mongoose.Types.ObjectId.isValid(secondUserId)) {
    return res.status(400).json({ message: "Invalid user IDs" });
  }

  try {
    const chat = await Chat.findOne({
      members: { $all: [firstUserId, secondUserId] }
    }).populate('members', 'username avatar email');

    if (chat) {
      return res.status(200).json(chat);
    }

    if (firstUserId === secondUserId) {
      return res.status(400).json({ message: "Cannot create chat with yourself" });
    }

    const newChat = new Chat({
      members: [firstUserId, secondUserId]
    });

    const savedChat = await newChat.save();
    const populatedChat = await Chat.populate(savedChat, {
      path: 'members',
      select: 'username avatar email'
    });

    res.status(201).json(populatedChat);
  } catch (err) {
    console.error("Error in createOrGetChat:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getUserChats = async (req, res) => {
  const userId = req.params.userId;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  try {
    const chats = await Chat.find({ 
      members: { $in: [userId] }
    })
    .populate('members', 'username avatar email')
    .populate({
      path: 'lastMessage',
      populate: {
        path: 'sender',
        select: 'username avatar'
      }
    })
    .sort({ updatedAt: -1 });

    res.status(200).json(chats);
  } catch (err) {
    console.error("Error in getUserChats:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.findChatBetweenUsers = async (req, res) => {
  const { firstUserId, secondUserId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(firstUserId) || 
      !mongoose.Types.ObjectId.isValid(secondUserId)) {
    return res.status(400).json({ message: "Invalid user IDs" });
  }

  try {
    const chat = await Chat.findOne({
      members: { $all: [firstUserId, secondUserId] }
    })
    .populate('members', 'username avatar email')
    .populate('lastMessage');

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    res.status(200).json(chat);
  } catch (err) {
    console.error("Error in findChatBetweenUsers:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.deleteChat = async (req, res) => {
  const chatId = req.params.chatId;

  if (!mongoose.Types.ObjectId.isValid(chatId)) {
    return res.status(400).json({ message: "Invalid chat ID" });
  }

  try {
    await Message.deleteMany({ chatId });
    
    const deletedChat = await Chat.findByIdAndDelete(chatId);
    
    if (!deletedChat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    res.status(200).json({ 
      message: "Chat deleted successfully",
      deletedChat 
    });
  } catch (err) {
    console.error("Error in deleteChat:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};