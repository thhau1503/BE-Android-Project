const { find } = require('../models/Chat');
const Message = require('../models/Message');

//Tạo tin nhắn mới
exports.createMessage = async (req, res) => {
    const io = req.app.get('socketio');
    const newMessage = new Message(req.body);
    try {
        const savedMessage = await newMessage.save();
        io.to(savedMessage.chatId).emit('message', savedMessage);
        res.status(200).json(savedMessage);
    } catch (err) {
        console.log(err.message);
        res.status(500).json({ message: err.message });
    }
}


//Lấy tin nhắn theo id
exports.getMessageById = async (req, res) => {
    const messageId = req.params.messageId;
    try {
        const message = await findMessageById(messageId);
        res.status(200).json(message);
    }
    catch (err) {
        console.log(err.message);
        res.status(500).json({ message: err.message });
    }
}

//Lấy tin nhắn theo id của đoạn chat
exports.getMessageByChatId = async (req, res) => {
    const chatId = req.params.chatId;
    try {
        const messages = await Message.find({ chatId: chatId });
        res.status(200).json(messages);
    } catch (err) {
        console.log(err.message);
        res.status(500).json({ message: err.message });
    }
}

//Xóa tin nhắn
exports.deleteMessage = async (req, res) => {
    const messageId = req.params.messageId;
    try {
        const message = await Message.findByIdAndDelete(messageId);
        res.status(200).json(message);
    }
    catch (err) {
        console.log(err.message);
        res.status(500).json({ message: err.message });
    }
}


//Tìm tin nhắn giữa 2 user
exports.findMessage = async (req, res) => {
    const { firstUserId, secondUserId } = req.params;
    try {
        const message = await Message.find({
            members: { $all: [firstUserId, secondUserId] },
        });
        res.status(200).json(message);
    }
    catch (err) {
        console.log(err.message);
        res.status(500).json({ message: err.message });
    }
};