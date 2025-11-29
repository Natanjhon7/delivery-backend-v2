const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Conexão MongoDB (NÃO BLOQUEIA O SERVIDOR)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://deliverybebidas:bebidasdelivery@cluster0.opeuney.mongodb.net/delivery?retryWrites=true&w=majority';

console.log('🔗 Iniciando conexão MongoDB...');

mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 5000, // Timeout de 5 segundos
  socketTimeoutMS: 45000,
})
.then(() => console.log('✅ MongoDB conectado!'))
.catch(err => {
  console.log('⚠️ MongoDB não conectado, mas servidor rodando:', err.message);
});

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

// ROTAS QUE FUNCIONAM MESMO SEM MONGODB

// Health check - SEMPRE FUNCIONA
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Backend funcionando!',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Rota padrão - SEMPRE FUNCIONA
app.get('/', (req, res) => {
  res.json({ 
    message: 'Delivery Backend - Online!',
    version: '3.0',
    status: 'operational'
  });
});

// GET - Buscar produtos (funciona mesmo sem DB)
app.get('/api/products', async (req, res) => {
  try {
    // Se MongoDB não está conectado, retorna array vazio
    if (mongoose.connection.readyState !== 1) {
      return res.json([]);
    }
    
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    // Em caso de erro, retorna array vazio
    res.json([]);
  }
});

// POST - Criar produto (só funciona se DB conectado)
app.post('/api/products', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: 'Database temporariamente indisponível' });
    }
    
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📡 Health: http://localhost:${PORT}/health`);
});