const express = require("express");
const app = express();

const http = require("http");
const server = http.createServer(app);
const moment = require("moment");

const {
  addUser,
  removeUser,
  findUser,
  checkUser,
  getUsersinroom,
} = require("./users");

const io = require("socket.io")(server, {
  cors: {
    origin: "https://master.d1kd7pgm0rmtuf.amplifyapp.com",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const PORT = process.env.PORT || 5000;

io.on("connection", (socket) => {
  socket.on("join", ({ name, room }) => {
    const { error, user } = addUser({ id: socket.id, name, room });

    socket.emit("message", {
      user: "admin",
      text: `${user.name},Welcome to ${user.room}`,
    });
    socket.broadcast
      .to(user.room)
      .emit("message", { user: "admin", text: `${user.name} have joined..!` });
    socket.join(user.room);

    io.to(user.room).emit("roomdata", {
      room: user.room,
      users: getUsersinroom(user.room),
    });
  });

  socket.on("sendMessage", (message, callback) => {
    const user = findUser(socket.id);
    io.to(user.room).emit("message", {
      user: user.name,
      text: message,
      time: moment().format("LT"),
    });
  });

  socket.on("checkuser", (user) => {
    const status = checkUser(user.name);
    if (status == true) {
      socket.emit("checkuser", "notavailable");
    } else {
      socket.emit("checkuser", { status: "available", data: user });
    }
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.room).emit("message", {
        user: "admin",
        text: `${user.name} has left.`,
      });
      io.to(user.room).emit("roomdata", {
        room: user.room,
        users: getUsersinroom(user.room),
      });
    }
  });
});

server.listen(PORT, () =>
  console.log(`Server started and listening on *: ${PORT}`)
);
