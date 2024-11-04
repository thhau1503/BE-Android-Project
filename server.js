const express = require('express');
const mongoose = require('mongoose');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swaggerConfig');
const socketIo = require('socket.io');
const http = require('http');
const cors = require('cors')
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "http://localhost:3000", 
        methods: ["GET", "POST"],
        credentials: true
    }
});

io.on('connection', (socket) => {
    console.log('New client connected: ' + socket.id);

    socket.on('join_room', (chatId) => {
        socket.join(chatId);
        console.log(`User joined room: ${chatId}`);
    });

    socket.on('leave_room', (chatId) => {
        socket.leave(chatId);
        console.log(`User left room: ${chatId}`);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

app.set('socketio', io);

// Kết nối tới MongoDB
const db = process.env.MONGO_URI;
mongoose.connect(db, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

app.use(express.json());
app.use(cors())

// Cấu hình Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const authRoutes = require('./routes/auth');
const notificationRoutes = require('./routes/notification');
const postRoutes = require('./routes/post');
const favoriteRoutes = require('./routes/favorite');
const chatRoutes = require('./routes/chat');
const requestRoutes = require('./routes/request');
const commentRoutes = require('./routes/comment');
const messageRoutes = require('./routes/message');

app.use('/api/auth', authRoutes);
app.use('/api/notification', notificationRoutes);
app.use('/api/post', postRoutes);
app.use('/api/favorite', favoriteRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/request', requestRoutes);
app.use('/api/comment', commentRoutes);
app.use('/api/message', messageRoutes);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 