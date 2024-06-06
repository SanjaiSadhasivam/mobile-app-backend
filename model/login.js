const mongoose = require("../config/dbconfig");

const userSchema = new mongoose.Schema({
  name: String,
  mobileNumber: String,
  password: String,
  email: String,
});
const User = mongoose.model("User", userSchema);
exports.User = User;
