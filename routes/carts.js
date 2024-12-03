const express = require('express');
const CartManager = require('../managers/CartManager');
const ProductManager = require('../managers/ProductManager'); // Suponiendo que tienes un ProductManager
const router = express.Router();

router.post('/', (req, res) => {
  const newCart = CartManager.createCart();
  res.status(201).json(newCart);
});

router.get('/:cid', (req, res) => {
  const cart = CartManager.getCartByIdWithPopulate(parseInt(req.params.cid));
  cart ? res.json(cart) : res.status(404).json({ error: 'Cart not found' });
});

router.post('/:cid/product/:pid', (req, res) => {
  const cart = CartManager.addProductToCart(parseInt(req.params.cid), parseInt(req.params.pid));
  cart ? res.json(cart) : res.status(404).json({ error: 'Cart or Product not found' });
});

router.delete('/:cid/products/:pid', (req, res) => {
  const updatedCart = CartManager.removeProductFromCart(parseInt(req.params.cid), parseInt(req.params.pid));
  updatedCart ? res.json(updatedCart) : res.status(404).json({ error: 'Cart or Product not found' });
});

router.put('/:cid', (req, res) => {
  const updatedCart = CartManager.updateAllProductsInCart(parseInt(req.params.cid), req.body);
  updatedCart ? res.json(updatedCart) : res.status(404).json({ error: 'Cart not found' });
});

router.put('/:cid/products/:pid', (req, res) => {
  const updatedCart = CartManager.updateProductQuantityInCart(
    parseInt(req.params.cid),
    parseInt(req.params.pid),
    req.body.quantity
  );
  updatedCart ? res.json(updatedCart) : res.status(404).json({ error: 'Cart or Product not found' });
});

router.delete('/:cid', (req, res) => {
  const updatedCart = CartManager.removeAllProductsFromCart(parseInt(req.params.cid));
  updatedCart ? res.json(updatedCart) : res.status(404).json({ error: 'Cart not found' });
});

module.exports = router;
