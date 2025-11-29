const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// DADOS MOCK (funcionam sempre)
const mockProducts = [
  {
    _id: "1",
    name: "Heineken 330ml",
    price: 8.90,
    category: "CERVEJAS",
    description: "Cerveja Heineken lata 330ml",
    imageUrl: "https://imagens.ne10.uol.com.br/veiculos/_midias/jpg/2024/05/08/heineken__4_-22134200.jpg",
    stock: 50
  },
  {
    _id: "2",
    name: "Skol 350ml",
    price: 5.90,
    category: "CERVEJAS",
    description: "Cerveja Skol lata 350ml",
    imageUrl: "https://www.imigrantesbebidas.com.br/bebida/images/products/full/20200722131111_7891999101027.jpg",
    stock: 30
  },
  {
    _id: "3", 
    name: "Brahma Duplo Malte",
    price: 7.50,
    category: "CERVEJAS",
    description: "Cerveja Brahma 350ml",
    imageUrl: "https://www.imigrantesbebidas.com.br/bebida/images/products/full/20220527165615_7891149102524.jpg",
    stock: 40
  },
  {
    _id: "4",
    name: "Coca-Cola 2L", 
    price: 9.90,
    category: "BEBIDAS",
    description: "Refrigerante Coca-Cola 2L",
    imageUrl: "https://courier-images-prod.imgix.net/produc_variant/00010267_9d8a7b7f-1b16-4b85-9c2e-0c3a0e5c1b09.jpg",
    stock: 20
  },
  {
    _id: "5",
    name: "Água Mineral 500ml",
    price: 3.50,
    category: "BEBIDAS", 
    description: "Água sem gás 500ml",
    imageUrl: "https://www.paodeacucar.com/img/uploads/1/323/665323.jpg",
    stock: 100
  }
];

// Tenta conectar MongoDB (mas não bloqueia)
const connectDB = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      console.log('⚠️  MONGODB_URI não configurada');
      return;
    }
    
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ MongoDB conectado!');
  } catch (error) {
    console.log('❌ MongoDB não conectado:', error.message);
  }
};

connectDB();

// Model
const ProductSchema = new mongoose.Schema({
  name: String,
  price: Number,
  category: String,
  description: String,
  imageUrl: String,
  stock: Number
}, { timestamps: true });

const Product = mongoose.model('Product', ProductSchema);

// Rotas
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    message: 'Backend funcionando com dados mock',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/products', async (req, res) => {
  try {
    // Sempre retorna os dados mock por enquanto
    res.json(mockProducts);
  } catch (error) {
    res.json(mockProducts);
  }
});

app.post('/api/products', async (req, res) => {
  try {
    // Se MongoDB conectado, salva no banco
    if (mongoose.connection.readyState === 1) {
      const product = new Product(req.body);
      await product.save();
      return res.status(201).json(product);
    } else {
      // Se não, simula com mock
      const newProduct = {
        _id: Date.now().toString(),
        ...req.body,
        createdAt: new Date().toISOString()
      };
      mockProducts.push(newProduct);
      return res.status(201).json(newProduct);
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📦 ${mockProducts.length} produtos carregados`);
});