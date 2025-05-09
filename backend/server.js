
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

const http = require('http');
const socketIo = require('socket.io');


dotenv.config();

const app = express();
app.use(express.json()); 

const server = http.createServer(app);
const io = socketIo(server);


mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connected"))
.catch(err => console.log(err));


app.use('/api/message', require('./routes/messageRoutes'));
app.use('/api/user', require('./routes/userRoutes'));


io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('sendMessage', (message) => {
    io.emit('message', message); 
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

