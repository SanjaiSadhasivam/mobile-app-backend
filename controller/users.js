const { User } = require("../model/login");
const Message = require("../model/message");

exports.users = async (req, res) => {
  try {
    const userId = req.params.userId;
    const users = await User.find({ _id: { $ne: userId } });
    res.status(200).json({ status: "ok", data: users });
  } catch (error) {
    console.log(error);
  }
};

exports.sendRequest = async (req, res) => {
  const { senderId, receiverId, message } = req.body;
  const receiver = await User.findById(receiverId);
  if (!receiver) {
    return res
      .status(404)
      .json({ status: "error", message: "Receiver not found" });
  }
  receiver.requests.push({ from: senderId, message });
  await receiver.save();
  res.status(200).json({ status: "ok", message: "Request sent successfully" });
};

exports.getRequests = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId).populate(
      "requests.from",
      "name email"
    );

    if (user) {
      // res.json(user.requests);
      res.status(200).json({
        status: "ok",
        data: user.requests,
      });
    } else {
      res.status(404).json({ status: "Error", message: "User not Found" });
    }
  } catch (error) {
    console.log(error);
  }
};

exports.acceptRequest = async (req, res) => {
  try {
    const { userId, requestId } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ status: "Error", message: "User not found" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $pull: { requests: { from: requestId } },
      },
      { new: true }
    );
    if (!updatedUser) {
      return res
        .status(404)
        .json({ status: "Error", message: "Request not found" });
    }

    await User.findByIdAndUpdate(userId, {
      $push: { friends: requestId },
    });

    const friendUser = await User.findByIdAndUpdate(requestId, {
      $push: { friends: userId },
    });
    if (!friendUser) {
      return res
        .status(404)
        .json({ status: "error", message: "Friend not found" });
    }
    res
      .status(200)
      .json({ status: "ok", message: "Request accepted successfully" });
  } catch (error) {
    console.log(error);
  }
};

exports.user = async (req, res) => {
  try {
    const userId = req.params.userId;
    const users = await User.findById(userId).populate("friends", "name email");
    res.json(users.friends);
  } catch (error) {
    console.log(error);
  }
};

exports.sendMessage = async (req, res) => {
  console.log("called");
  const userSocketMap = {};
  try {
    const { senderId, receiverId, messages } = req.body;
    console.log(senderId, "senderId");
    console.log(receiverId, "receiverId");
    console.log(messages, "message");
    const newMessage = new Message({
      senderId,
      receiverId,
      messages,
    });
    await newMessage.save();

    const receiverSocketId = userSocketMap[receiverId];

    if (receiverSocketId) {
      console.log("emitting receive message event to the receiver", receiverId);
      io.to(receiverSocketId).emit("newMessage", newMessage);
    } else {
      console.log("Receiver socket id not found");
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log(error);
  }
};

exports.message = async (req, res) => {
  try {
    const { senderId, receiverId } = req.query;

    const message = await Message.find({
      $or: [
        { senderId: senderId, receiverId: receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    });
  } catch (error) {}
};
