const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '30d',
  });
};

const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    console.log('📝 Tentando registrar usuário:', { name, email, phone });

    // Validação
    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Todos os campos são obrigatórios: name, email, password, phone'
      });
    }

    // Verificar se usuário já existe
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'Usuário já existe com este email'
      });
    }

    // Criar usuário
    const user = await User.create({ name, email, password, phone });

    console.log('✅ Usuário criado no MongoDB:', user._id);

    res.status(201).json({
      success: true,
      message: 'Usuário registrado com sucesso!',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      },
      token: generateToken(user._id)
    });

  } catch (error) {
    console.error('❌ Erro no registro:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor: ' + error.message
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('🔐 Tentando login para:', email);

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email e senha são obrigatórios'
      });
    }

    // Buscar usuário
    const user = await User.findOne({ email });
    
    if (user && (await user.comparePassword(password))) {
      console.log('✅ Login bem-sucedido para:', email);
      
      res.json({
        success: true,
        message: 'Login realizado com sucesso!',
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          address: user.address
        },
        token: generateToken(user._id)
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
      message: 'Erro interno do servidor: ' + error.message
    });
  }
};

module.exports = { register, login };
