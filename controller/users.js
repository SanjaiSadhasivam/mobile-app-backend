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
  const { senderId, receiverId } = req.body;

  const receiver = await User.findById(receiverId);
  if (!receiver) {
    return res
      .status(404)
      .json({ status: "error", message: "Receiver not found" });
  }
  receiver.requests.push({ from: senderId });
  await receiver.save();
  res.status(200).json({ status: "ok", message: "Request sent successfully" });
};

exports.deleteRequest = async (req, res) => {
  const { senderId, receiverId } = req.body;

  const receiver = await User.findById(receiverId);
  if (!receiver) {
    return res
      .status(404)
      .json({ status: "error", message: "Receiver not found" });
  }

  receiver.requests = receiver.requests.filter(
    (request) => request.from.toString() !== senderId
  );

  await receiver.save();

  res
    .status(200)
    .json({ status: "ok", message: "Request deleted successfully" });
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

    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ status: "Error", message: "User not found" });
    }

    // Remove the request from the user's requests array
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

    // Add the requestId to the user's friends array using $addToSet
    await User.findByIdAndUpdate(userId, {
      $addToSet: { friends: requestId },
    });

    // Add the userId to the friend's friends array using $addToSet
    const friendUser = await User.findByIdAndUpdate(requestId, {
      $addToSet: { friends: userId },
    });
    if (!friendUser) {
      return res
        .status(404)
        .json({ status: "Error", message: "Friend not found" });
    }

    // Send a success response
    res
      .status(200)
      .json({ status: "ok", message: "Request accepted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: "Error", message: "Internal Server Error" });
  }
};

exports.user = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Find user and populate friends
    const user = await User.findById(userId).populate("friends", "name email");

    if (!user) {
      return res
        .status(404)
        .json({ status: "error", message: "User not found" });
    }

    const friendsWithRecentMessages = await Promise.all(
      user.friends.map(async (friend) => {
        const recentMessage = await Message.findOne({
          $or: [
            { senderId: friend._id, receiverId: userId },
            { senderId: userId, receiverId: friend._id },
          ],
        })
          .sort({ timeStamp: -1 })
          .exec();

        return {
          ...friend.toObject(),
          recentMessage,
        };
      })
    );

    res.json(friendsWithRecentMessages);
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
};

exports.sendMessage = async (req, res) => {
  const userSocketMap = {};
  try {
    const { senderId, receiverId, messages } = req.body;

    const newMessage = new Message({
      senderId,
      receiverId,
      messages,
    });
    await newMessage.save();

    const receiverSocketId = userSocketMap[receiverId];
    // if (receiverSocketId) {
    //   io.to(receiverSocketId).emit("newMessage", newMessage);
    // } else {
    //   console.log("Receiver socket id not found");
    // }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log(error);
  }
};

exports.message = async (req, res) => {
  try {
    const { senderId, receiverId } = req.query;

    const messages = await Message.find({
      $or: [
        { senderId: senderId, receiverId: receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    }).populate("senderId", "_id name");
    res.status(200).json(messages);
  } catch (error) {
    console.log(error);
  }
};
