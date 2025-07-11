

const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('./models/Product');


mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('connected to mongodb for seeding'))
.catch((err) => console.error('mongodb connection error:',err));

const products = [

{
    name:' laptop',
    price: 999.9,
    description: 'High-performance laptop with 16GB RAM',
    image: '/images/laptop.jpeg',
    category: 'Electronics',
    stock: 10
},

{
    name: 'Smartphone',
    price: 499.99,
    description: 'Latest smartphone with 5G support',
    image: '/images/smartphone.jpeg',
    category: 'Electronics',
    stock: 20
  },

{
    name: 'Mouse',
    price: 100.00,
    description: 'slight and looking good mouse with cable ',
    image: '/images/mouse.jpeg',
    category: 'Electronics',
    stock: 10
  },

{
    name: ' Smart Tv',
    price: 300.55,
    description: 'Latest smart-tv with iinternet support',
    image: '/images/tv.jpeg',
    category: 'Electronics',
    stock: 20
  },

{
    name: 'Remote',
    price: 499.99,
    description: 'smart and slight  remote ',
    image: '/images/remote.jpeg',
    category: 'Electronics',
    stock: 20
  },

{
    name: 'Camera',
    price: 120.22,
    description: 'Latest camera with modern light support',
    image: '/images/camera.jpeg',
    category: 'Electronics',
    stock: 20
  },

  {
    name: 'Computer',
    price: 400.44,
    description: 'Latest computer with 5G support',
    image: '/images/computer.jpeg',
    category: 'Electronics',
    stock: 30
  },

  
  {
    name: 'Headphones',
    price: 79.99,
    description: 'Wireless headphones with noise cancellation',
    image: '/images/headphone.jpeg',
    category: 'Accessories',
    stock: 15
  }
];


const seedProducts = async () => {

try {
    await Product.deleteMany();
    await Product.insertMany(products);
    console.log('product seeded successfully');
    mongoose.connection.close();

}
catch (err) {
    console.error('error seeding products:', err);
}
};

seedProducts();









