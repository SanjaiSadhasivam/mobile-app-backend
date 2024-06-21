const mongoose = require("../config/dbconfig");

const userSchema = new mongoose.Schema({
  name: String,
  mobileNumber: String,
  password: String,
  email: String,
  requests: [
    {
      from: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      status: {
        type: String,
        enum: ["pending", "accepted", "rejected"],
        default: "pending",
      },
    },
  ],
  friends: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});
const User = mongoose.model("User", userSchema);
exports.User = User;
