const jwt = require('jsonwebtoken');
const User = require('../models/User');


const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Acesso negado, token não enviado' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token inválido' });
  }
};

const adminAuth = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Acesso restrito a administradores' });
    }
    next();
  } catch (err) {
    res.status(500).json({ message: 'Erro interno' });
  }
};

module.exports = { auth, adminAuth };
