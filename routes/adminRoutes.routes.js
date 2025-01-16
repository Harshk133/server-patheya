const express = require("express");
const router = express.Router();

const jwt = require('jsonwebtoken');

const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const JWT_A_SECRET = process.env.JWT_ADMIN_SECRET || "your_jwt_secret";

router.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    // Generate token
    const token = jwt.sign({ username }, JWT_A_SECRET, { expiresIn: "1h" });
    return res.status(200).json({ success: true, token });
  } else {
    return res
      .status(401)
      .json({ success: false, message: "Invalid credentials" });
  }
});

module.exports = router;
