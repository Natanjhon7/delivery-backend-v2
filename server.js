const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// ✅ CARREGAR VARIÁVEIS DE AMBIENTE
require('dotenv').config();

const app = express();
const path = require('path');

app.use(cors());
app.use(express.json());

// ✅ SCHEMAS DO MONGODB
const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  description: String,
  imageUrl: String,
  stock: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'customer' },
  phone: String
}, { timestamps: true });

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  imageUrl: String,
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const OrderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  items: [{
    productId: String,
    name: String,
    price: Number,
    quantity: Number,
    imageUrl: String
  }],
  total: { type: Number, required: true },
  status: { type: String, default: 'pending' },
  address: String,
  paymentMethod: { type: String, default: 'cash' }
}, { timestamps: true });

// ✅ MODELS
const Product = mongoose.model('Product', ProductSchema);
const User = mongoose.model('User', UserSchema);
const Category = mongoose.model('Category', CategorySchema);
const Order = mongoose.model('Order', OrderSchema);

// ✅ MIDDLEWARE DE AUTENTICAÇÃO
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token de acesso necessário'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }
};

// ✅ CONEXÃO MONGODB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ MongoDB CONECTADO com sucesso!');
    
  } catch (error) {
    console.log('❌ ERRO MongoDB:', error.message);
    process.exit(1);
  }
};

// ✅ DADOS EM MEMÓRIA PARA CARRINHO
let userCarts = {};

// ✅ ROTAS DE PRODUTOS (MONGODB REAL)
app.get('/api/products', async (req, res) => {
  try {
    const { category, search } = req.query;
    let filter = { isActive: true };

    if (category) filter.category = category;
    if (search) filter.name = { $regex: search, $options: 'i' };

    const products = await Product.find(filter);
    
    res.json({
      success: true,
      count: products.length,
      data: products,
      source: 'mongodb'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar produtos: ' + error.message
    });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Produto não encontrado'
      });
    }

    res.json({
      success: true,
      data: product
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar produto'
    });
  }
});

// ✅ ROTAS DE CATEGORIAS
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true });
    
    res.json({
      success: true,
      count: categories.length,
      data: categories
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar categorias'
    });
  }
});

// ✅ ROTA DE LOGIN REAL
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email e senha são obrigatórios'
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email ou senha inválidos'
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Email ou senha inválidos'
      });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      message: 'Login realizado com sucesso!',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone
      },
      token: token
    });

  } catch (error) {
    console.error('❌ Erro no login:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// ✅ ROTA DE REGISTRO
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Nome, email e senha são obrigatórios'
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Usuário já existe'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role: 'customer'
    });

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso!',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone
      },
      token: token
    });

  } catch (error) {
    console.error('❌ Erro no registro:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// ✅ ROTAS DE CARRINHO
app.get('/api/cart', auth, async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const cart = userCarts[userId] || [];
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    res.json({
      success: true,
      data: cart,
      total: total,
      count: cart.length
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar carrinho'
    });
  }
});

app.post('/api/cart/add', auth, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const userId = req.user._id.toString();
    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produto não encontrado'
      });
    }

    if (!userCarts[userId]) {
      userCarts[userId] = [];
    }

    const existingItem = userCarts[userId].find(item => item.productId === productId);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      userCarts[userId].push({
        productId: product._id.toString(),
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        quantity: quantity
      });
    }

    res.json({
      success: true,
      message: 'Produto adicionado ao carrinho',
      data: userCarts[userId]
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao adicionar ao carrinho'
    });
  }
});

app.delete('/api/cart/remove/:productId', auth, async (req, res) => {
  try {
    const userId = req.user._id.toString();
    
    if (userCarts[userId]) {
      userCarts[userId] = userCarts[userId].filter(item => item.productId !== req.params.productId);
    }

    res.json({
      success: true,
      message: 'Produto removido do carrinho',
      data: userCarts[userId] || []
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao remover do carrinho'
    });
  }
});

// ✅ ROTAS DE PEDIDOS
app.post('/api/orders', auth, async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const cart = userCarts[userId] || [];
    
    if (cart.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Carrinho vazio'
      });
    }

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    const order = await Order.create({
      userId: userId,
      items: cart,
      total: total,
      address: req.body.address || 'Endereço não informado',
      paymentMethod: req.body.paymentMethod || 'cash',
      status: 'pending'
    });

    // Limpar carrinho após criar pedido
    userCarts[userId] = [];

    res.status(201).json({
      success: true,
      message: 'Pedido criado com sucesso!',
      data: order
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao criar pedido: ' + error.message
    });
  }
});

app.get('/api/orders', auth, async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const orders = await Order.find({ userId: userId }).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: orders.length,
      data: orders
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar pedidos'
    });
  }
});

// ✅ ROTAS BÁSICAS
app.get('/', (req, res) => {
  res.json({ 
    success: true,
    message: '🚀 Backend Delivery App com MONGODB REAL!',
    database: 'MongoDB Atlas',
    version: '2.0 - Database Real',
    timestamp: new Date().toISOString(),
    routes: {
      products: 'GET /api/products',
      categories: 'GET /api/categories',
      auth: {
        login: 'POST /api/auth/login',
        register: 'POST /api/auth/register'
      },
      cart: {
        get: 'GET /api/cart (auth)',
        add: 'POST /api/cart/add (auth)',
        remove: 'DELETE /api/cart/remove/:productId (auth)'
      },
      orders: {
        create: 'POST /api/orders (auth)',
        list: 'GET /api/orders (auth)'
      },
      health: 'GET /api/health'
    }
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    success: true,
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

app.get('/api/info', (req, res) => {
  res.json({
    success: true,
    name: 'Delivery Backend API',
    version: '2.0',
    status: 'online',
    environment: process.env.NODE_ENV,
    database: 'MongoDB Atlas'
  });
});

// ✅ ROTA POST PARA CRIAR PRODUTOS
app.post('/api/products', async (req, res) => {
  try {
    const { name, price, category, description, imageUrl, stock } = req.body;

    // Validação básica
    if (!name || !price || !category) {
      return res.status(400).json({
        success: false,
        message: 'Nome, preço e categoria são obrigatórios'
      });
    }

    const product = await Product.create({
      name,
      price: parseFloat(price),
      category,
      description: description || '',
      imageUrl: imageUrl || 'https://via.placeholder.com/300x300?text=Sem+Imagem',
      stock: parseInt(stock) || 0,
      isActive: true
    });

    res.status(201).json({
      success: true,
      message: 'Produto criado com sucesso!',
      data: product
    });

  } catch (error) {
    console.error('❌ Erro ao criar produto:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor: ' + error.message
    });
  }
});

const startServer = async () => {
  await connectDB();
  
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🎉 BACKEND DELIVERY - PRODUÇÃO!`);
    console.log(`🚀 Porta: ${PORT}`);
    console.log(`📦 MongoDB: ✅ CONECTADO`);
    console.log(`🌐 Ambiente: ${process.env.NODE_ENV}`);
    console.log(`🔗 URL: https://seu-backend.onrender.com`);
    console.log(`💡 API Health: https://seu-backend.onrender.com/health`);
  });
};

startServer();