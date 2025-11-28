const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Conexão MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://deliverybebidas:bebidasdelivery@cluster0.opeuney.mongodb.net/delivery?retryWrites=true&w=majority';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB conectado!'))
  .catch(err => console.log('❌ MongoDB erro:', err.message));

// Model de Product
const ProductSchema = new mongoose.Schema({
  name: String,
  price: Number,
  category: String,
  description: String,
  imageUrl: String,
  stock: Number
}, { timestamps: true });

const Product = mongoose.model('Product', ProductSchema);

// ROTAS

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Backend V2 funcionando!',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Rota padrão
app.get('/', (req, res) => {
  res.json({ 
    message: 'Delivery Backend V2 - Online!',
    version: '2.0'
  });
});

// GET - Buscar produtos
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST - Criar produto
app.post('/api/products', async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor V2 rodando na porta ${PORT}`);
});