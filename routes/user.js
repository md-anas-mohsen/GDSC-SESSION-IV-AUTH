const router = require("express").Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");
const user = require("../models/user");

const JWT_SECRET = "A-SECURE-SECRET-STRING";

router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  if (!email || !name || !password) {
    return res.status(400).json({
      success: false,
      message: "Please provide all fields",
    });
  }

  const emailExists = await User.findOne({
    email,
  });

  if (emailExists) {
    return res.status(400).json({
      success: false,
      message: "Email already registered",
    });
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await User.create({
    name,
    email,
    password: hashedPassword,
  });

  return res.status(201).json({
    success: true,
    message: "Successfully registered",
  });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({
    email,
  });

  if (!user) {
    res.status(404).json({
      success: false,
      message: "User not registered",
    });
  }

  const passwordCorrect = await bcrypt.compare(password, user.password);

  if (!passwordCorrect) {
    res.status(401).json({
      success: false,
      message: "Incorrect password",
    });
  }

  const token = jwt.sign({ id: user._id }, JWT_SECRET, {
    expiresIn: "7d",
  });

  return res
    .status(200)
    .cookie("token", token, {
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      httpOnly: true,
    })
    .json({
      success: true,
      token,
      message: "Logged in",
    });
});

router.get("/me", async (req, res) => {
  const { token } = req.cookies;
  try {
    const decoded = await jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);

    return res.status(200).json({
      success: true,
      user: {
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }
});

router.post("/logout", async (req, res) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

module.exports = router;
