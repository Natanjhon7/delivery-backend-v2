const express = require('express');
const { 
  getProducts, 
  getProductById, 
  createProduct, 
  updateProduct, 
  deleteProduct 
} = require('../controllers/productController');

// ✅ COMENTE TEMPORARIAMENTE O MIDDLEWARE (vamos criar depois)
// const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', getProducts);
router.get('/:id', getProductById);

// ✅ SEM AUTENTICAÇÃO POR ENQUANTO
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

module.exports = router;