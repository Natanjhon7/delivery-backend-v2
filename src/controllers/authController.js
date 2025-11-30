const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Dados mock como fallback
const mockUsers = [
  {
    _id: "1",
    name: "Jhon",
    email: "jhon@gmail.com",
    password: "senha123",
    role: "admin"
  }
];

// ✅ GERAR TOKEN
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'fallback_secret_delivery_app', {
    expiresIn: '30d',
  });
};

// ✅ LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('🔐 Tentando login para:', email);

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email e senha são obrigatórios'
      });
    }

    // Tenta autenticar com MongoDB primeiro
    let user = null;
    let isMock = false;

    try {
      user = await User.findOne({ email });
      if (user) {
        const isMatch = await user.comparePassword(password);
        if (!isMatch) user = null;
      }
    } catch (error) {
      console.log('❌ Erro no MongoDB, usando mock...');
    }

    // Fallback para mock
    if (!user) {
      user = mockUsers.find(u => u.email === email && u.password === password);
      isMock = true;
    }

    if (user) {
      console.log('✅ Login bem-sucedido para:', email);
      
      const token = generateToken(user._id);
      
      res.json({
        success: true,
        message: 'Login realizado com sucesso!',
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        token: token,
        isMock: isMock
      });
    } else {
      console.log('❌ Login falhou para:', email);
      res.status(401).json({
        success: false,
        message: 'Email ou senha inválidos'
      });
    }

  } catch (error) {
    console.error('❌ Erro no login:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// ✅ REGISTRO
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Nome, email e senha são obrigatórios'
      });
    }

    // Verifica se usuário já existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Usuário já existe'
      });
    }

    // Cria novo usuário
    const user = new User({
      name,
      email,
      password
    });

    await user.save();

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso!',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
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

module.exports = router;