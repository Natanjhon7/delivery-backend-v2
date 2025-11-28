import mongoose from 'mongoose';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado ao MongoDB para seed');

    // Limpar collections existentes
    await Category.deleteMany({});
    await Product.deleteMany({});
    console.log('✅ Collections limpas');

    // Criar categorias
    const categories = await Category.insertMany([
      {
        name: 'Cervejas',
        description: 'Cervejas nacionais e importadas'
      },
      {
        name: 'Vodkas', 
        description: 'Diversos tipos de vodka'
      },
      {
        name: 'Whisky',
        description: 'Whiskies nacionais e importados'
      },
      {
        name: 'Vinhos',
        description: 'Vinhos nacionais e importados'
      },
      {
        name: 'Energéticos',
        description: 'Bebidas energéticas'
      },
      {
        name: 'Refrigerantes',
        description: 'Refrigerantes diversos'
      }
    ]);

    console.log('✅ Categorias criadas:', categories.length);

    // Criar produtos
    const products = await Product.insertMany([
      {
        name: 'Heineken Long Neck',
        description: 'Cerveja Heineken 330ml',
        price: 8.90,
        category: categories[0]._id,
        stock: 50,
        alcoholContent: 5.0,
        volume: '330ml',
        brand: 'Heineken'
      },
      {
        name: 'Brahma Duplo Malte',
        description: 'Cerveja Brahma 350ml',
        price: 5.90,
        category: categories[0]._id,
        stock: 100,
        alcoholContent: 4.8,
        volume: '350ml',
        brand: 'Brahma'
      },
      {
        name: 'Smirnoff Ice',
        description: 'Bebida à base de vodka sabor limão',
        price: 12.50,
        category: categories[1]._id,
        stock: 30,
        alcoholContent: 5.0,
        volume: '275ml',
        brand: 'Smirnoff'
      },
      {
        name: 'Red Bull',
        description: 'Energético Red Bull 250ml',
        price: 9.90,
        category: categories[4]._id,
        stock: 100,
        alcoholContent: 0.0,
        volume: '250ml',
        brand: 'Red Bull'
      }
    ]);

    console.log('✅ Produtos criados:', products.length);

    // Criar um usuário admin (se não existir)
    const adminExists = await User.findOne({ email: 'admin@delivery.com' });
    if (!adminExists) {
      const adminUser = await User.create({
        name: 'Administrador',
        email: 'admin@delivery.com',
        password: 'admin123',
        phone: '11999999999',
        role: 'admin'
      });
      console.log('✅ Usuário admin criado:', adminUser.email);
    } else {
      console.log('✅ Usuário admin já existe');
    }

    console.log('🎉 SEED COMPLETADO COM SUCESSO!');
    console.log('📊 RESUMO:');
    console.log('   -', categories.length, 'categorias criadas');
    console.log('   -', products.length, 'produtos criados');

  } catch (error) {
    console.error('❌ Erro no seed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Conexão com MongoDB fechada');
  }
};

seedDatabase();