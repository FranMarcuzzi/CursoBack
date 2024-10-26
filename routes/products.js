const express = require('express');
const ProductManager = require('../managers/ProductManager');

const router = express.Router();

router.get('/', (req, res) => {
  const products = ProductManager.getProducts();
  res.json(products);
});

router.get('/:pid', (req, res) => {
  const product = ProductManager.getProductById(parseInt(req.params.pid));
  product ? res.json(product) : res.status(404).json({ error: 'Product not found' });
});

router.post('/', (req, res) => {
  const { title, description, code, price, status, stock, category, thumbnails } = req.body;
  const newProduct = ProductManager.addProduct({ title, description, code, price, status, stock, category, thumbnails });
  res.status(201).json(newProduct);
});

router.put('/:pid', (req, res) => {
  const updatedProduct = ProductManager.updateProduct(parseInt(req.params.pid), req.body);
  updatedProduct ? res.json(updatedProduct) : res.status(404).json({ error: 'Product not found' });
});

router.delete('/:pid', (req, res) => {
  const updatedProducts = ProductManager.deleteProduct(parseInt(req.params.pid));
  res.json(updatedProducts);
});

module.exports = router;
