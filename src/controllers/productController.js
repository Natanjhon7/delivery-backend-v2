const Product = require('../models/Product');

// ✅ DADOS MOCK COMO FALLBACK
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
  }
];

// GET / - Listar todos os produtos
const getProducts = async (req, res) => {
  try {
    console.log('📦 Buscando produtos...');
    
    // ✅ USA MOCK DIRETAMENTE POR ENQUANTO
    let filteredProducts = mockProducts;
    const { category, search } = req.query;
    
    if (category) {
      filteredProducts = filteredProducts.filter(p => 
        p.category.toLowerCase() === category.toLowerCase()
      );
    }
    
    if (search) {
      filteredProducts = filteredProducts.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    res.json({
      success: true,
      count: filteredProducts.length,
      data: filteredProducts,
      source: 'mock'
    });

  } catch (error) {
    console.log('❌ Erro ao buscar produtos:', error.message);
    
    res.json({
      success: true,
      count: mockProducts.length,
      data: mockProducts,
      source: 'mock-error'
    });
  }
};

const getProductById = async (req, res) => {
  try {
    console.log('🔍 GET BY ID - ID recebido:', req.params.id);

    const product = mockProducts.find(p => p._id === req.params.id);
    
    if (product) {
      res.json({
        success: true,
        data: product,
        source: 'mock'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Produto não encontrado'
      });
    }

  } catch (error) {
    console.log('❌ Erro no getProductById:', error.message);
    
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// ✅ FUNÇÕES SIMPLIFICADAS - SEM MONGODB POR ENQUANTO
const createProduct = async (req, res) => {
  try {
    const newProduct = {
      _id: Date.now().toString(),
      ...req.body,
      createdAt: new Date().toISOString()
    };
    
    mockProducts.push(newProduct);
    
    res.status(201).json({
      success: true,
      data: newProduct,
      message: 'Produto criado com sucesso!',
      source: 'mock'
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Erro ao criar produto: ' + error.message
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    const productIndex = mockProducts.findIndex(p => p._id === req.params.id);
    
    if (productIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Produto não encontrado'
      });
    }

    mockProducts[productIndex] = {
      ...mockProducts[productIndex],
      ...req.body,
      updatedAt: new Date().toISOString()
    };

    res.json({
      success: true,
      data: mockProducts[productIndex],
      message: 'Produto atualizado com sucesso!',
      source: 'mock'
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Erro ao atualizar produto: ' + error.message
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const productIndex = mockProducts.findIndex(p => p._id === req.params.id);
    
    if (productIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Produto não encontrado'
      });
    }

    const deletedProduct = mockProducts.splice(productIndex, 1)[0];

    res.json({
      success: true,
      message: 'Produto deletado com sucesso',
      data: deletedProduct,
      source: 'mock'
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