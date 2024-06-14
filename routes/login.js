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
} = require("../controller/users");
const router = express.Router();

router.use(cors());

router.post("/login", login);
router.post("/signup", signup);
router.post("/userData", userData);
router.get("/users/:userId", users);
router.post("/sentrequest", sendRequest);
router.get("/getrequests/:userId", getRequests);
router.post("/acceptrequest", acceptRequest);
router.post("/sendMessage", sendMessage);
router.get("/message", message);
router.get("/user/:userId", user);
module.exports = router;
