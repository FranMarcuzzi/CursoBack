const fs = require('fs');
const path = require('path');

class ProductManager {
    constructor(filePath) {
        this.filePath = filePath || path.join(__dirname, '../data/products.json');
    }

    async getProducts() {
        try {
            const data = await fs.promises.readFile(this.filePath, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            if (error.code === 'ENOENT') {
                // Si el archivo no existe, devolver una lista vacía
                return [];
            }
            throw error;
        }
    }

    // Leer productos de forma sincrónica
    getProductsSync() {
        try {
            const data = fs.readFileSync(this.filePath, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            if (error.code === 'ENOENT') {
                return [];
            }
            throw error;
        }
    }

    // Agregar un nuevo producto al archivo JSON
    async addProduct(product) {
        const products = await this.getProducts();

        // Generar un nuevo ID único
        const newProduct = {
            id: products.length > 0 ? products[products.length - 1].id + 1 : 1,
            ...product,
        };

        products.push(newProduct);

        await fs.promises.writeFile(this.filePath, JSON.stringify(products, null, 2));
        return newProduct;
    }

    // Eliminar un producto por ID
    async deleteProduct(id) {
        const products = await this.getProducts();
        const updatedProducts = products.filter((product) => product.id !== parseInt(id));

        if (updatedProducts.length === products.length) {
            throw new Error('Producto no encontrado');
        }

        await fs.promises.writeFile(this.filePath, JSON.stringify(updatedProducts, null, 2));
        return { message: `Producto con ID ${id} eliminado` };
    }
}

module.exports = ProductManager;
