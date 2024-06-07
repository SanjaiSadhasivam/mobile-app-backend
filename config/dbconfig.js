const mongoose = require("mongoose");

mongoose
  .connect(
    "mongodb+srv://sanjaisnj97:kizNQjB1pxxPp1lG@cluster0.sfg6xrt.mongodb.net/mobile-chat-app?retryWrites=true&w=majority&appName=Cluster0"
  )
  .then((res) => {
    console.log("DB Connected");
  })
  .catch((e) => {
    console.log(e);
  });
module.exports = mongoose;
