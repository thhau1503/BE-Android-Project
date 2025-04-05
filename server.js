const express = require('express');
const mongoose = require('mongoose');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swaggerConfig');
const socketIo = require('socket.io');
const http = require('http');
const cors = require('cors')
const path = require('path');
require('dotenv').config();


const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: ["http://localhost:3000","http://localhost:3001", "https://thhau1503.github.io"], 
        methods: ["GET", "POST"],
        credentials: true
    }
});

app.use(cors({
    origin: ['http://localhost:3000', 'https://thhau1503.github.io','http://localhost:3001'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept'],
}));

io.on('connection', (socket) => {
    console.log('New client connected: ' + socket.id);

    socket.on("sendMessage", (messagedata) => {
        io.to(messagedata.chatId).emit("receiveMessage", messagedata);
    })

    socket.on("joinChat", (chatId) => {
        socket.join(chatId);
        console.log(`User joined chat: ${chatId} with id: ${socket.id}`);
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

app.use(express.static(path.join(__dirname, "build")));

const authRoutes = require('./routes/auth');
const notificationRoutes = require('./routes/notification');
const postRoutes = require('./routes/post');
const favoriteRoutes = require('./routes/favorite');
const chatRoutes = require('./routes/chat');
const requestRoutes = require('./routes/request');
const commentRoutes = require('./routes/comment');
const orderRoutes = require('./routes/order');
const reportRoutes = require('./routes/report');
const blogRoutes = require('./routes/blog');
const uploadRoutes = require('./routes/upload');
const packageRoutes = require('./routes/package');
const messageRoutes = require('./routes/message');

app.use('/api/auth', authRoutes);
app.use('/api/notification', notificationRoutes);
app.use('/api/post', postRoutes);
app.use('/api/favorite', favoriteRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/request', requestRoutes);
app.use('/api/comment', commentRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/report', reportRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/messages', messageRoutes);

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 