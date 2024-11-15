const express = require('express');
const handlebars = require('express-handlebars');
const { Server } = require('socket.io');
const ProductManager = require('./managers/ProductManager');

const app = express();
const PORT = 8080;

// Configuración de handlebars
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

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

// Rutas HTTP
app.get('/home', async (req, res) => {
    const products = await productManager.getProducts();
    res.render('home', { products });
});

app.get('/realtimeproducts', async (req, res) => {
    res.render('realTimeProducts');
});

// Ruta para obtener todos los productos (API REST)
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
        // Emitir el evento de actualización a todos los clientes conectados
        io.emit('updateProducts', { products: updatedProducts });
        res.status(201).send('Producto agregado');
    } catch (error) {
        res.status(500).send('Error al agregar el producto');
    }
});

app.delete('/api/products/:id', async (req, res) => {
    const productId = req.params.id;
    try {
        await productManager.deleteProduct(productId);
        const updatedProducts = await productManager.getProducts();
        // Emitir el evento de actualización a todos los clientes conectados
        io.emit('updateProducts', { products: updatedProducts });
        res.status(200).send('Producto eliminado');
    } catch (error) {
        res.status(500).send('Error al eliminar el producto');
    }
});

io.on('connection', (socket) => {
    socket.on('addProduct', async (product) => {
        try {
            await productManager.addProduct(product);
            const updatedProducts = await productManager.getProducts();
            // Emitir el evento de actualización a todos los clientes conectados
            io.emit('updateProducts', { products: updatedProducts });
        } catch (error) {
            console.error('Error al agregar el producto desde Socket.IO:', error);
        }
    });

    socket.on('deleteProduct', async (data) => {
      let productId;
  
      if (typeof data === 'object' && data !== null && 'id' in data) {
          productId = data.id;  // Extrae el ID si viene dentro de un objeto
      } else {
          productId = data;  // Si es un número directamente, úsalo
      }
  
      console.log('Product ID to delete:', productId); // Asegúrate de que es el valor correcto
  
      try {
          await productManager.deleteProduct(productId);
          const updatedProducts = await productManager.getProducts();
          io.emit('updateProducts', { products: updatedProducts });
      } catch (error) {
          console.error('Error al eliminar el producto desde Socket.IO:', error);
      }
  });
  
  
});
