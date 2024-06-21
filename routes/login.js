const express = require("express");
const cors = require("cors");
const { login, signup, userData } = require("../controller/auth");
const {
  users,
  sendRequest,
  acceptRequest,
  getRequests,
  sendMessage,
  message,
  user,
  deleteRequest,
} = require("../controller/users");
const router = express.Router();

router.use(cors());

router.post("/login", login);
router.post("/signup", signup);
router.post("/userData", userData);
router.get("/users/:userId", users);
router.post("/sentrequest", sendRequest);
router.delete("/deleterequest", deleteRequest);
router.get("/getrequests/:userId", getRequests);
router.post("/acceptrequest", acceptRequest);
router.post("/sendMessage", sendMessage);
router.get("/messages", message);
router.get("/user/:userId", user);
module.exports = router;
