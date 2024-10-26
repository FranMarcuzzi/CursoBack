const fs = require('fs');
const path = './data/products.json';

class ProductManager {
  static getProducts() {
    const data = fs.readFileSync(path);
    return JSON.parse(data);
  }

  static saveProducts(products) {
    fs.writeFileSync(path, JSON.stringify(products, null, 2));
  }

  static addProduct(product) {
    const products = this.getProducts();
    product.id = products.length ? products[products.length - 1].id + 1 : 1;
    products.push(product);
    this.saveProducts(products);
    return product;
  }

  static getProductById(id) {
    return this.getProducts().find((product) => product.id === id);
  }

  static updateProduct(id, updatedFields) {
    const products = this.getProducts();
    const index = products.findIndex((product) => product.id === id);
    if (index !== -1) {
      products[index] = { ...products[index], ...updatedFields };
      this.saveProducts(products);
      return products[index];
    }
    return null;
  }

  static deleteProduct(id) {
    const products = this.getProducts();
    const newProducts = products.filter((product) => product.id !== id);
    this.saveProducts(newProducts);
    return newProducts;
  }
}

module.exports = ProductManager;
