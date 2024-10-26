const express = require('express');
const CartManager = require('../managers/CartManager');

const router = express.Router();

router.post('/', (req, res) => {
  const newCart = CartManager.createCart();
  res.status(201).json(newCart);
});

router.get('/:cid', (req, res) => {
  const cart = CartManager.getCartById(parseInt(req.params.cid));
  cart ? res.json(cart) : res.status(404).json({ error: 'Cart not found' });
});

router.post('/:cid/product/:pid', (req, res) => {
  const cart = CartManager.addProductToCart(parseInt(req.params.cid), parseInt(req.params.pid));
  cart ? res.json(cart) : res.status(404).json({ error: 'Cart or Product not found' });
});

module.exports = router;
