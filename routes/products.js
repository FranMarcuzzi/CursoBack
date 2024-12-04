const express = require('express');
const ProductManager = require('../controllers/ProductManager'); // Asegúrate de que la ruta es correcta
const router = express.Router();

// Instancia de ProductManager con la ruta correcta
const productManager = new ProductManager('../data/products.json');

// Obtener productos con paginación, filtro y orden
router.get('/', async (req, res) => {
  try {
    const { limit = 10, page = 1, sort, query } = req.query;
    
    // Filtrar productos si se ha especificado un query
    let filter = [];
    if (query) {
      filter = [{ category: query }, { available: query === 'true' }];
    }

    // Obtener productos con las opciones especificadas
    const products = await productManager.getProducts();
    
    // Filtrar productos según el query, si existe
    const filteredProducts = products.filter(product => 
      filter.length === 0 || filter.some(f => product.category === f.category || (f.available && product.available === f.available))
    );

    // Ordenar productos por precio
    const sortedProducts = filteredProducts.sort((a, b) => {
      if (sort === 'asc') {
        return a.price - b.price;
      } else if (sort === 'desc') {
        return b.price - a.price;
      }
      return 0;
    });

    // Paginación
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedProducts = sortedProducts.slice(startIndex, endIndex);

    res.json({
      status: 'success',
      payload: paginatedProducts,
      totalPages: Math.ceil(sortedProducts.length / limit),
      prevPage: page > 1 ? page - 1 : null,
      nextPage: endIndex < sortedProducts.length ? page + 1 : null,
      page,
      hasPrevPage: page > 1,
      hasNextPage: endIndex < sortedProducts.length,
      prevLink: page > 1 ? `/products?page=${page - 1}&limit=${limit}&query=${query}&sort=${sort}` : null,
      nextLink: endIndex < sortedProducts.length ? `/products?page=${page + 1}&limit=${limit}&query=${query}&sort=${sort}` : null,
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Obtener un producto específico por ID
router.get('/:pid', async (req, res) => {
  try {
    const products = await productManager.getProducts();
    const product = products.find(p => p.id === parseInt(req.params.pid));
    
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ error: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Crear un nuevo producto
router.post('/', async (req, res) => {
  const { title, description, code, price, status, stock, category, thumbnails } = req.body;
  try {
    const newProduct = await productManager.addProduct({
      title,
      description,
      code,
      price,
      status,
      stock,
      category,
      thumbnails,
    });
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Actualizar un producto
router.put('/:pid', async (req, res) => {
  try {
    const products = await productManager.getProducts();
    let productIndex = products.findIndex(p => p.id === parseInt(req.params.pid));

    if (productIndex === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const updatedProduct = { ...products[productIndex], ...req.body };
    products[productIndex] = updatedProduct;
    await productManager.updateProduct(products);

    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Eliminar un producto
router.delete('/:pid', async (req, res) => {
  try {
    const deletedProduct = await productManager.deleteProduct(req.params.pid);
    res.json({ status: 'success', message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

module.exports = router;
