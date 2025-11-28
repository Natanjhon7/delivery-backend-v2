const Category = require('../models/Category');

const getCategories = async (req, res) => {
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
      message: 'Erro ao buscar categorias: ' + error.message
    });
  }
};

const createCategory = async (req, res) => {
  try {
    const category = await Category.create(req.body);

    res.status(201).json({
      success: true,
      data: category
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Erro ao criar categoria: ' + error.message
    });
  }
};

module.exports = { getCategories, createCategory };
