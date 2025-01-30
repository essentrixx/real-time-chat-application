const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const { generateMessage, generateLocationMessage } = require('./utils/messages');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const publicPath = path.join(__dirname, '../public');
app.use(express.static(publicPath));

io.on('connection', (socket) => {
    console.log('New WebSocket connection');

    // for new user
    socket.emit('message', generateMessage('Welcome!'));
    socket.broadcast.emit('message', 'A new user has joined');

    // for message
    socket.on('sendMessage', (message, callback) => {
        io.emit('message', generateMessage(message));
        callback();
    })

    // for location
    socket.on('sendLocation', (coords, callback) => {
        io.emit('locationMessage', generateLocationMessage(`https://google.com/maps?q=${coords.latitude},${coords.longitude}`));
        callback();
    })

    // disconnected
    socket.on('disconnect', () => {
        io.emit('message', generateMessage('A user has left'));
    })
})

PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
})