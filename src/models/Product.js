const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String, 
    required: true
  },
  imageUrl: {
    type: String
  },
  stock: {
    type: Number,
    default: 0,
    min: 0
  },
  alcoholContent: {
    type: Number,
    min: 0,
    max: 100
  },
  volume: {
    type: String
  },
  brand: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', ProductSchema, 'products');