const express = require("express");
const mongoose = require("./config/dbconfig");
const Message = require("./model/message");
const cors = require("cors");
const app = express();

const PORT = process.env.PORT || 5000;
app.use(express.json());
app.use(cors());

const authentication = require("./routes/login");
const path = require("path");
app.use("/auth", authentication);

const { createServer } = require("http");
const http = createServer(app);
http.listen(PORT, () => {
  console.log(`Server connected successfully on ${PORT}`);
});

const { Server } = require("socket.io");
const io = new Server(http, {
  path: "/mySocket",
});
//{"userId" : "socket ID"}

const userSocketMap = {};

io.on("connection", (socket) => {
  console.log("a user is connected", socket.id);

  const userId = socket.handshake.query.userId;

  console.log("userid", userId);

  if (userId !== "undefined") {
    userSocketMap[userId] = socket.id;
  }

  console.log("user socket data", userSocketMap);
  socket.on("join", (roomid) => {
    socket.join(roomid);
  });
  socket.on("sendMessage", ({ senderId, receiverId, messages, roomid }) => {
    console.log(roomid, "msg");
    const receiverSocketId = userSocketMap[receiverId];

    console.log("receiver Id", receiverId);

    io.to(roomid).emit("newMessage", {
      senderId,
      messages,
    });
    // if (receiverSocketId) {
    socket.on("disconnect", () => {
      console.log("user disconnected", socket.id);
      delete userSocketMap[userId];
    });
    // }
  });
});
