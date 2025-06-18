const Message = require('../models/Message');
const Chat = require('../models/Chat');
const mongoose = require('mongoose');



const findMessageById = async (messageId) => {
  if (!mongoose.Types.ObjectId.isValid(messageId)) {
    throw new Error('Invalid message ID');
  }
  return await Message.findById(messageId);
};

exports.createMessage = async (req, res) => {
  const { chatId, content } = req.body;
  const senderId = req.user.id;

  if (!mongoose.Types.ObjectId.isValid(chatId) || !content?.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Chat ID and message content are required'
    });
  }

  try {
    const chat = await Chat.findOne({
      _id: chatId,
      members: { $in: [senderId] }
    });

    if (!chat) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to send message in this chat'
      });
    }

    const newMessage = new Message({
      chatId,
      sender: senderId,
      content: content.trim()
    });

    const savedMessage = await newMessage.save();

    await Chat.findByIdAndUpdate(chatId, {
      lastMessage: savedMessage._id,
      updatedAt: new Date()
    });

    const populatedMessage = await Message.populate(savedMessage, {
      path: 'sender',
      select: 'username avatar'
    });

    const io = req.app.get('socketio');
    if (io) {
      io.to(chatId).emit('receiveMessage', populatedMessage);
    }

    res.status(201).json({
      message: populatedMessage
    });

  } catch (err) {
    console.error('Error creating message:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

exports.getMessageById = async (req, res) => {
  try {
    const message = await findMessageById(req.params.messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    const chat = await Chat.findOne({
      _id: message.chatId,
      members: { $in: [req.user.id] }
    });

    if (!chat) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to view this message'
      });
    }

    const populatedMessage = await Message.populate(message, {
      path: 'sender',
      select: 'username avatar'
    });

    res.status(200).json({
      success: true,
      message: populatedMessage
    });

  } catch (err) {
    console.error('Error getting message:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

exports.getMessageByChatId = async (req, res) => {
  const { chatId } = req.params;
  const userId = req.user.id;
  const { page = 1, limit = 20 } = req.query;

  if (!mongoose.Types.ObjectId.isValid(chatId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid chat ID'
    });
  }

  try {
    const chat = await Chat.findOne({
      _id: chatId,
      members: { $in: [userId] }
    });

    if (!chat) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to view this chat'
      });
    }

    const messages = await Message.find({ chatId })
      .populate('sender', 'username avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    await Message.updateMany(
      {
        chatId,
        sender: { $ne: userId },
        readBy: { $ne: userId }
      },
      { $addToSet: { readBy: userId } }
    );

    res.status(200).json({
      success: true,
      messages: messages.reverse(),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: await Message.countDocuments({ chatId })
      }
    });

  } catch (err) {
    console.error('Error getting messages:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

//
exports.deleteMessage = async (req, res) => {
  try {
    const message = await findMessageById(req.params.messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    const chat = await Chat.findOne({
      _id: message.chatId,
      members: { $in: [req.user.id] }
    });

    if (!chat) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to delete this message'
      });
    }

    const deletedMessage = await Message.findByIdAndDelete(req.params.messageId);

    if (deletedMessage) {
      const chat = await Chat.findById(deletedMessage.chatId);
      if (chat?.lastMessage?.equals(deletedMessage._id)) {
        const prevMessage = await Message.findOne(
          { chatId: deletedMessage.chatId, _id: { $ne: deletedMessage._id } },
          {},
          { sort: { createdAt: -1 } }
        );

        await Chat.findByIdAndUpdate(deletedMessage.chatId, {
          lastMessage: prevMessage?._id || null
        });
      }

      const io = req.app.get('socketio');
      if (io) {
        io.to(deletedMessage.chatId).emit('messageDeleted', {
          messageId: deletedMessage._id,
          chatId: deletedMessage.chatId,
          deletedBy: req.user.id
        });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Message deleted successfully',
      deletedMessage
    });

  } catch (err) {
    console.error('Error deleting message:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};