const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');

const { generateMessage, generateLocationMessage } = require('./utils/message');
const { isString } = require('./utils/validations');
const { Users } = require('./utils/users');

const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;
var app = express();
var server = http.createServer(app);
var io = socketIO(server);
var users = new Users();

app.use(express.static(publicPath));

io.on('connection', socket => {
  console.log('New user connected');

  socket.on('join', (params, callback) => {
    if (!isString(params.name) || !isString(params.room)) {
      return callback('Bắt buột nhập tên và động.');
    }

    socket.join(params.room);
    users.removeUser(socket.id);
    users.addUser(socket.id, params.name, params.room);

    io.to(params.room).emit('updateUserList', users.getUserList(params.room));
    socket.emit(
      'newMessage',
      generateMessage('Thằng mặt lầy', 'Chào mừng bạn vào động')
    );
    socket.broadcast
      .to(params.room)
      .emit(
        'newMessage',
        generateMessage('Thằng mặt lầy', `${params.name} đã vào động.`)
      );
    callback();
  });

  socket.on('createMessage', (message, callback) => {
    var user = users.getUser(socket.id);

    if (user && isString(message.text)) {
      io.to(user.room).emit(
        'newMessage',
        generateMessage(user.name, message.text, user)
      );
    }

    callback();
  });

  socket.on('createLocationMessage', coords => {
    var user = users.getUser(socket.id);

    if (user) {
      io.to(user.room).emit(
        'newLocationMessage',
        generateLocationMessage(user.name, coords.latitude, coords.longitude)
      );
    }
  });

  socket.on('disconnect', () => {
    var user = users.removeUser(socket.id);

    if (user) {
      io.to(user.room).emit('updateUserList', users.getUserList(user.room));
      io.to(user.room).emit(
        'newMessage',
        generateMessage('Thằng mặt lầy', `${user.name} đã rời khỏi phòng.`)
      );
    }
  });
});

server.listen(port, () => {
  console.log(`Server is up on ${port}`);
});
