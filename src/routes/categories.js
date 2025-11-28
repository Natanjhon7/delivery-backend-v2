const express = require('express');
const { getCategories, createCategory } = require('../controllers/categoryController');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', getCategories);
router.post('/', auth, adminAuth, createCategory);

module.exports = router;
