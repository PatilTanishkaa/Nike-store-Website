// models/Order.js
const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  product: { type: String, required: true },
  size: { type: String },
  color: { type: String },
  price: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Order", OrderSchema);
