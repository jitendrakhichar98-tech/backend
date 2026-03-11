const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
require("dotenv").config();

const app = express();

// FIXED CORS
app.use(cors({
  origin: "https://crown-time-watches.netlify.app",
  methods: ["GET","POST"],
  allowedHeaders: ["Content-Type"],
  credentials: true
}));

app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB connected"))
.catch(err => console.log(err));

// User Schema
const UserSchema = new mongoose.Schema({
  email: String,
  password: String
});

const User = mongoose.model("User", UserSchema);

// Signup
app.post("/api/signup", async (req, res) => {
  try {
    const { email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      email,
      password: hashedPassword
    });

    await user.save();

    res.json({ success: true, msg: "User registered" });

  } catch (err) {
    res.status(500).json({ success: false, msg: "Server error" });
  }
});

// Login
app.post("/api/login", async (req, res) => {

  try {

    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user)
      return res.status(400).json({ success:false, msg:"User not found" });

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch)
      return res.status(400).json({ success:false, msg:"Invalid credentials" });

    const token = jwt.sign(
      { id:user._id },
      process.env.JWT_SECRET || "secretKey"
    );

    res.json({ success:true, token });

  } catch (err) {
    res.status(500).json({ success:false, msg:"Server error" });
  }

});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));