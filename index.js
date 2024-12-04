const express = require('express');
const handlebars = require('express-handlebars');
const Handlebars = require('handlebars'); // Importar Handlebars para registrar el helper
const { Server } = require('socket.io');
const ProductManager = require('./managers/ProductManager');
const mongoose = require('mongoose');

// Conexión a MongoDB Atlas
const uri = 'mongodb+srv://fmarcuzzi:Marcuzz1@cluster0.nrv2h.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Conectado a MongoDB Atlas'))
  .catch((err) => console.error('Error al conectar con MongoDB Atlas:', err));

const app = express();
const PORT = 8080;

Handlebars.registerHelper('eq', function (a, b, options) {
  if (options && typeof options.fn === 'function' && typeof options.inverse === 'function') {
    return a === b ? options.fn(this) : options.inverse(this);
  }
  return a === b;
});

app.engine('handlebars', handlebars.engine());
app.set('view engine', 'handlebars');
app.set('views', './views');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Inicializar ProductManager
const productManager = new ProductManager();

// Crear servidor HTTP y Socket.IO
const httpServer = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
const io = new Server(httpServer);

// Configuración de Socket.IO
io.on('connection', (socket) => {
  console.log('New client connected');

  // Enviar productos actualizados al conectar un nuevo cliente
  productManager.getProducts().then(products => {
    socket.emit('updateProducts', { products });
  });

  // Manejar agregar producto
  socket.on('addProduct', async (product) => {
    try {
      await productManager.addProduct(product);
      const updatedProducts = await productManager.getProducts();
      io.emit('updateProducts', { products: updatedProducts }); // Emitir actualización
    } catch (error) {
      console.error('Error al agregar el producto desde Socket.IO:', error);
    }
  });

  // Manejar eliminar producto
  socket.on('deleteProduct', async (data) => {
    let productId;

    if (typeof data === 'object' && data !== null && 'id' in data) {
      productId = data.id; // Extrae el ID si viene dentro de un objeto
    } else {
      productId = data; // Si es un número directamente, úsalo
    }

    console.log('Product ID to delete:', productId); // Asegúrate de que es el valor correcto

    try {
      await productManager.deleteProduct(productId);
      const updatedProducts = await productManager.getProducts();
      io.emit('updateProducts', { products: updatedProducts }); // Emitir actualización
    } catch (error) {
      console.error('Error al eliminar el producto desde Socket.IO:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

app.get('/home', async (req, res) => {
  const products = await productManager.getProducts();
  res.render('home', { products });
});

app.get('/realtimeproducts', (req, res) => {
  res.render('realTimeProducts');
});

app.get('/api/products', async (req, res) => {
  try {
    const products = await productManager.getProducts();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).send('Error al obtener los productos');
  }
});

// Ruta para agregar un producto
app.post('/api/products', async (req, res) => {
  const product = req.body;
  try {
    await productManager.addProduct(product);
    const updatedProducts = await productManager.getProducts();
    io.emit('updateProducts', { products: updatedProducts }); // Emitir actualización
    res.status(201).send('Producto agregado');
  } catch (error) {
    res.status(500).send('Error al agregar el producto');
  }
});

// Ruta para eliminar un producto
app.delete('/api/products/:id', async (req, res) => {
  const productId = req.params.id;
  try {
    await productManager.deleteProduct(productId);
    const updatedProducts = await productManager.getProducts();
    io.emit('updateProducts', { products: updatedProducts }); // Emitir actualización
    res.status(200).send('Producto eliminado');
  } catch (error) {
    res.status(500).send('Error al eliminar el producto');
  }
});
