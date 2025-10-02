// server.js
require('dotenv').config();
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const cors = require('cors');

// Models
const User = require('./models/User');
const Order = require('./models/Order');


const app = express();

// --- Middlewares ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files from /public
app.use(express.static(path.join(__dirname, 'public')));

// --- MongoDB Connection ---
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/nikeStore';

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected'))
.catch((err) => {
  console.error('❌ MongoDB connection error:', err.message);
  process.exit(1);
});

// --- Routes ---
// Login Page (first page)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Signup Page
app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

// Signup API
app.post('/api/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: '⚠️ Please fill all fields' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: '⚠️ User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    // Redirect to home.html after successful signup
    return res.status(201).json({ message: '🎉 Signup successful', redirect: '/home.html' });
  } catch (err) {
    console.error('Signup Error:', err);
    res.status(500).json({ message: '❌ Server error' });
  }
});

// Login API
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: '⚠️ Please fill all fields' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: '⚠️ User not found. Please sign up!' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: '⚠️ Invalid credentials' });
    }

    // Redirect to home.html after successful login
    return res.status(200).json({ message: '✅ Login successful', redirect: '/home.html' });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ message: '❌ Server error' });
  }
});


// --- ✅ ORDER API ROUTE (paste here) ---
app.post('/api/order', async (req, res) => {
  try {
    const { name, phone, address, product, size, color, price } = req.body;

    if (!name || !phone || !address || !product || !price) {
      return res.status(400).json({ message: "⚠️ Please fill all required fields" });
    }

    const newOrder = new Order({
      name,
      phone,
      address,
      product,
      size,
      color,
      price,
    });

    await newOrder.save();
    return res.status(201).json({ message: "🎉 Order placed successfully!" });
  } catch (err) {
    console.error("Order Error:", err);
    res.status(500).json({ message: "❌ Server error" });
  }
});


// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
