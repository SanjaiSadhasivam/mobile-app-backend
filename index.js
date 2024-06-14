const express = require("express");
const mongoose = require("./config/dbconfig");
const Message = require("./model/message");
const cors = require("cors");
const app = express();

const PORT = process.env.PORT || 5000;
app.use(express.json());
app.use(cors());

app.listen(PORT, () => {
  console.log(`Server connected successfully on ${PORT}`);
});
const authentication = require("./routes/login");
app.use("/auth", authentication);

const http = require("http").createServer(app);

const io = require("socket.io")(http);

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

  socket.on("disconnect", () => {
    console.log("user disconnected", socket.id);
    delete userSocketMap[userId];
  });

  socket.on("sendMessage", ({ senderId, receiverId, message }) => {
    const receiverSocketId = userSocketMap[receiverId];

    console.log("receiver Id", receiverId);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("receiveMessage", {
        senderId,
        message,
      });
    }
  });
});

http.listen(4000, () => {
  console.log("Socket.IO running on port 4000");
});
