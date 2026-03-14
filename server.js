const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
require("dotenv").config();

const app = express();

/* ---------- Middleware ---------- */

app.use(cors({
  origin: "https://crown-time-watches1.netlify.app",
  methods: ["GET","POST"],
  allowedHeaders: ["Content-Type","Authorization"]
}));

app.use(express.json());

/* ---------- Test Route ---------- */

app.get("/", (req,res)=>{
  res.send("Backend is running successfully!");
});

/* ---------- MongoDB ---------- */

mongoose.connect(process.env.MONGO_URI)
.then(()=> console.log("MongoDB Connected"))
.catch(err => console.log(err));

/* ---------- User Schema ---------- */

const UserSchema = new mongoose.Schema({
  email:{
    type:String,
    required:true,
    unique:true
  },
  password:{
    type:String,
    required:true
  }
});

const User = mongoose.model("User",UserSchema);

const OrderSchema = new mongoose.Schema({
  email: String,
  items: Array,
  total: Number,
  paymentId: String,
  date: {
    type: Date,
    default: Date.now
  }
});

const Order = mongoose.model("Order", OrderSchema);
/* ---------- Signup ---------- */

app.post("/api/signup", async (req,res)=>{

  try{

    const {email,password} = req.body;

    const existingUser = await User.findOne({email});

    if(existingUser){
      return res.json({
        success:false,
        msg:"User already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password,10);

    const user = new User({
      email,
      password:hashedPassword
    });

    await user.save();

    res.json({
      success:true,
      msg:"Signup successful"
    });

  }catch(err){
    res.status(500).json({
      success:false,
      msg:"Server error"
    });
  }

});

/* ---------- Login ---------- */

app.post("/api/login", async (req,res)=>{

  try{

    const {email,password} = req.body;

    const user = await User.findOne({email});

    if(!user){
      return res.json({
        success:false,
        msg:"User not found"
      });
    }

    const isMatch = await bcrypt.compare(password,user.password);

    if(!isMatch){
      return res.json({
        success:false,
        msg:"Invalid password"
      });
    }

    const token = jwt.sign(
      {id:user._id},
      process.env.JWT_SECRET,
      {expiresIn:"7d"}
    );

    res.json({
      success:true,
      token
    });

  }catch(err){
    res.status(500).json({
      success:false,
      msg:"Server error"
    });
  }

});

app.post("/api/save-order", async (req, res) => {

  try {

    const { email, items, total, paymentId } = req.body;

    const order = new Order({
      email,
      items,
      total,
      paymentId
    });

    await order.save();

    res.json({ success:true });

  } catch(err) {

    res.status(500).json({ success:false });

  }

});

app.get("/api/orders/:email", async (req, res) => {

  try {

    const orders = await Order.find({ email: req.params.email });

    res.json(orders);

  } catch(err) {

    res.status(500).json({ success:false });

  }

});
/* ---------- Server ---------- */

const PORT = process.env.PORT || 5000;

app.listen(PORT, ()=>{
  console.log(`Server running on port ${PORT}`);
});