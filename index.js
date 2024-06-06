const express = require("express");
const mongoose = require("./config/dbconfig");
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
