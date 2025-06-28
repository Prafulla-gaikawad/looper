const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  user_id: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model("User", userSchema);

// Registration Controller
exports.registerUser = async (req, res) => {
  const { name, user_id, email, password } = req.body;
  try {
    // Check if user_id or email already exists
    const existingUser = await User.findOne({ $or: [{ user_id }, { email }] });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User ID or Email already exists" });
    }
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, user_id, email, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Login Controller
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    // Generate JWT
    const token = jwt.sign(
      { user_id: user.user_id, email: user.email, name: user.name },
      process.env.JWT_SECRET || "yoursecretkey",
      { expiresIn: "1h" }
    );
    res.json({
      token,
      user: { name: user.name, user_id: user.user_id, email: user.email },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
