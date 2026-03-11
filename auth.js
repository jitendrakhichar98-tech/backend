const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = express.Router();

// Dummy user (later DB से आएगा)
const users = [{ email: "test@test.com", password: "$2b$10$hashedPasswordHere" }];

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);
  if (!user) return res.status(400).json({ success: false, msg: "User not found" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ success: false, msg: "Invalid credentials" });

  const token = jwt.sign({ email: user.email }, "secretKey");
  res.json({ success: true, token });
});

module.exports = router;