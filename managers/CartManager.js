const fs = require('fs');
const path = './data/carts.json';

class CartManager {
  static getCarts() {
    const data = fs.readFileSync(path);
    return JSON.parse(data);
  }

  static saveCarts(carts) {
    fs.writeFileSync(path, JSON.stringify(carts, null, 2));
  }

  static createCart() {
    const carts = this.getCarts();
    const newCart = { id: carts.length ? carts[carts.length - 1].id + 1 : 1, products: [] };
    carts.push(newCart);
    this.saveCarts(carts);
    return newCart;
  }

  static getCartById(id) {
    return this.getCarts().find((cart) => cart.id === id);
  }

  static addProductToCart(cartId, productId) {
    const carts = this.getCarts();
    const cart = carts.find((cart) => cart.id === cartId);
    if (cart) {
      const productInCart = cart.products.find((p) => p.product === productId);
      if (productInCart) {
        productInCart.quantity += 1;
      } else {
        cart.products.push({ product: productId, quantity: 1 });
      }
      this.saveCarts(carts);
      return cart;
    }
    return null;
  }
}

module.exports = CartManager;
