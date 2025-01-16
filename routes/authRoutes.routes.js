const express = require("express");
const { oauth2client } = require("../utils/googleConfig");
const router = express.Router();
const axios = require("axios");
const User = require("../models/User.model");
const jwt = require("jsonwebtoken");

// Route to get all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('name email image');
    res.status(200).json({ users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

router.get("/test", (req, res) => {
  res.send("Testing... routes!");
});

router.get("/google", async (req, res) => {
  try {
    const { code } = req.query;
    const googleRes = await oauth2client.getToken(code);
    oauth2client.setCredentials(googleRes.tokens);

    const userRes = await axios.get(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`
    );
    const { email, name, picture } = userRes.data;

    let user = await User.findOne({ email });

    if(!user) {
      user = await User.create({
        name,
        email,
        image: picture,
      });
    }

    const { _id } = user;
    const token = jwt.sign({
        _id,
        email
    }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_TIMEOUT
    });

    return res.status(200).json({ message: "Success",  token, user    });
  } catch (error) {
    console.error("Error while requesting google oauth: ", error);
    res.status(500).json({ message: "Error", error  });
  }
});

module.exports = router;
