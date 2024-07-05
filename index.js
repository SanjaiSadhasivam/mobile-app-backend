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
const {
  AddMsgFromSocket,
  sendRequestFromSocket,
} = require("./controller/users");
const io = new Server(http, {
  path: "/mySocket",
});
//{"userId" : "socket ID"}

const userSocketMap = {};
let unreadMessages = {};
let activeUsers = [];
io.on("connection", (socket) => {
  socket.on("me", (id) => {
    socket.join(id);
  });
  console.log("a user is connected", socket.id);

  const userId = socket.handshake.query.userId;

  console.log("userid", userId);

  if (userId !== "undefined") {
    userSocketMap[userId] = socket.id;
  }

  socket.on("me", (id) => {
    socket.join(id);
    if (!activeUsers.includes(id) && id !== null && id !== "null") {
      activeUsers.push(id);
    }
    io.emit(
      "activeUsers",
      activeUsers.filter((i) => i !== "")
    );
  });

  console.log(activeUsers, "onlineStatus");
  socket.on("join", (roomid) => {
    socket.join(roomid);
  });
  socket.on("removeUser", (userId) => {
    console.log("user disconnected successs", userId);
    const userStatus = activeUsers.filter((i) => i !== userId);
    activeUsers = userStatus.filter((i) => i !== "");
    console.log(activeUsers, "removedUser");
    io.emit("activeUsers", activeUsers);
  });
  socket.on(
    "sendMessage",
    async ({ senderId, receiverId, messages, roomid, timeStamp }) => {
      // socket.to(roomid).emit("notification", messages);

      io.to(receiverId).emit("notification", messages);
      const newMsg = await AddMsgFromSocket({
        senderId,
        receiverId,
        messages,
      }).then((data) => data);

      if (newMsg) {
        io.to(roomid).emit("newMessage", {
          senderId,
          messages,
          timeStamp: newMsg.timeStamp,
        });
      }

      if (receiverId in unreadMessages) {
        unreadMessages[receiverId]++;
      } else {
        unreadMessages[receiverId] = 1;
      }

      // Emit the updated unread message count to the receiver
      io.to(receiverId).emit("unreadMessageCount", {
        to: receiverId,
        count: unreadMessages[receiverId],
      });

      socket.on("disconnect", () => {
        console.log("user disconnected", socket.id);
      });
      // }
    }
  );

  socket.on("sentrequest", async ({ userData }) => {
    socket.to(userData.receiverId).emit("getRequest", userData);
  });
  socket.on("deleteRequest", async ({ userData }) => {
    console.log(userData.data.receiverId, "receiverId");

    socket.to(userData.data.receiverId).emit("getRequest", userData);
  });
  socket.on("deleteSenderRequest", async ({ userData }) => {
    console.log(userData.data.senderId, "receiverId");

    socket.to(userData.data.senderId).emit("getRequest", userData);
  });

  socket.on("markMessagesAsRead", (receiverId) => {
    unreadMessages[receiverId] = 0;
    io.to(receiverId).emit("unreadMessageCount", {
      to: receiverId,
      count: 0,
    });
  });
});
