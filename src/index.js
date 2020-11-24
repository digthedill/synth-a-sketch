const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");

const {
  addUser,
  removeUser,
  grabUser,
  grabAllUsers,
} = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectory = path.join(__dirname, "../public");

app.use(express.static(publicDirectory));

io.on("connection", (socket) => {
  socket.emit("welcomeMsg", "Welcome");

  socket.on("join", ({ username, room }) => {
    const user = addUser({ id: socket.id, username, room });
    socket.join(user.room);
    socket.emit("username-display", grabUser(socket.id));

    socket.on("mouse", (data) => {
      socket.broadcast.to(user.room).emit("mouse", data);
    });

    //emulate this with audio
    socket.on("audio", (data) => {
      socket.broadcast.to(user.room).emit("audio", data);
    });

    io.to(user.room).emit("roomName", user.room);

    io.to(user.room).emit("displayAllUsers", grabAllUsers(user.room));

    //update display all users
    socket.to(user.room).emit("message", `${user.username} has joined`);
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    if (user) {
      console.log(`${user.username} has left`);
    }
  });
});

server.listen(port, () => {
  console.log("server running on " + port);
});
