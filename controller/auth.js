const jwt = require("jsonwebtoken");
const secretKey = "hgdhet4546587698djrhegrx4232y54s3y6xG##@$^^U^";
const bcrypt = require("bcrypt");
const { User } = require("../model/login");

exports.login = async (req, res) => {
  try {
    const { mobileNumber, password } = req.body;

    const user = await User.findOne({ mobileNumber });
    if (!user) {
      return res
        .status(200)
        .json({ status: "error", message: "User not found" });
    }

    const passwordValidation = await bcrypt.compare(password, user.password);
    if (!passwordValidation) {
      return res
        .status(200)
        .json({ status: "error", message: "Invalid password" });
    }

    const token = jwt.sign({ userData: user }, secretKey, {
      expiresIn: "24h",
    });
    res.status(200).json({ status: "ok", token: token });
  } catch (error) {
    console.log(error);
  }
};

exports.signup = async (req, res) => {
  try {
    const { name, mobileNumber, password, email } = req.body;

    const user = await User.findOne({ mobileNumber });
    if (!user) {
      const hashedPassword = await bcrypt.hash(password, 10);
      const response = await User.create({
        name,
        mobileNumber,
        password: hashedPassword,
        email,
      });
      if (response) {
        res
          .status(200)
          .json({ status: "ok", message: "User created successfully" });
      } else {
        res.status(500).json({ status: 500, message: "Something went wrong" });
      }
    } else {
      res.status(500).json({ status: 500, message: "user already registered" });
    }
  } catch (error) {
    console.log(error);
  }
};
