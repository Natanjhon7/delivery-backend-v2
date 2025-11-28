const Product = require('../models/Product');

// GET / - Listar todos os produtos (JÁ EXISTE)
const getProducts = async (req, res) => {
  try {
    const { category, search } = req.query;
    let filter = { isActive: true };

    if (category) {
      filter.category = category;
    }

    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    const products = await Product.find(filter).populate('category');

    res.json({
      success: true,
      count: products.length,
      data: products
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar produtos: ' + error.message
    });
  }
};


const getProductById = async (req, res) => {
  try {
    console.log('🔍 GET BY ID - ID recebido:', req.params.id);
    console.log('🔍 URL completa:', req.originalUrl);
    
    const product = await Product.findById(req.params.id).populate('category');
    
    console.log('🔍 Produto encontrado:', product);
    
    if (!product || !product.isActive) {
      console.log('❌ Produto não encontrado ou inativo');
      return res.status(404).json({
        success: false,
        message: 'Produto não encontrado'
      });
    }

    console.log('✅ Produto encontrado com sucesso');
    res.json({
      success: true,
      data: product
    });

  } catch (error) {
    console.log('❌ Erro no getProductById:', error.message);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar produto: ' + error.message
    });
  }
};

// POST / - Criar produto (JÁ EXISTE)
const createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    await product.populate('category');

    res.status(201).json({
      success: true,
      data: product
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Erro ao criar produto: ' + error.message
    });
  }
};

// PUT /:id - Atualizar produto
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('category');

    if (!product) {
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
    res.status(400).json({
      success: false,
      message: 'Erro ao atualizar produto: ' + error.message
    });
  }
};

// DELETE /:id - Deletar produto (soft delete)
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produto não encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Produto deletado com sucesso',
      data: product
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao deletar produto: ' + error.message
    });
  }
};



module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};