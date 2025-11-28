const mongoose = require('mongoose');

const NomeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  imageUrl: String, 
  price: {
    type: Number,
    required: true,
    min: 0
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String, 
    required: true
  },
  image: {
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


module.exports = mongoose.model('Product', NomeSchema, 'products');
