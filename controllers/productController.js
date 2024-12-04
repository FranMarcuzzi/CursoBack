
const ProductManager = require('../models/ProductManager'); 

const productManager = new ProductManager();

const getAllProducts = async (req, res) => {
    try {
        const products = await productManager.getProducts();
        res.status(200).json(products); 
    } catch (error) {
        console.error('Error al obtener los productos:', error);
        res.status(500).send('Error al obtener productos');
    }
};

const addProduct = async (req, res) => {
    try {
        const newProduct = await productManager.addProduct(req.body); // Obtener el producto del cuerpo de la solicitud
        res.status(201).json(newProduct); // Responder con el nuevo producto
    } catch (error) {
        console.error('Error al agregar el producto:', error);
        res.status(500).send('Error al agregar producto');
    }
};

const deleteProduct = async (req, res) => {
    const { id } = req.params;
    try {
        const response = await productManager.deleteProduct(id);
        res.status(200).json(response); // Responder con el mensaje de éxito
    } catch (error) {
        console.error('Error al eliminar el producto:', error);
        res.status(500).send('Error al eliminar producto');
    }
};

const filterProducts = async (req, res) => {
    const { query } = req.query;
    try {
        const products = await productManager.getProducts();
        const filteredProducts = products.filter(product =>
            product.title.toLowerCase().includes(query.toLowerCase()) ||
            product.category.toLowerCase().includes(query.toLowerCase())
        );
        res.status(200).json(filteredProducts); 
    } catch (error) {
        console.error('Error al filtrar los productos:', error);
        res.status(500).send('Error al filtrar productos');
    }
};

const sortProducts = async (req, res) => {
    const { sort } = req.query;
    try {
        const products = await productManager.getProducts();
        const sortedProducts = products.sort((a, b) => {
            if (sort === 'asc') {
                return a.price - b.price;
            } else {
                return b.price - a.price;
            }
        });
        res.status(200).json(sortedProducts); 
    } catch (error) {
        console.error('Error al ordenar los productos:', error);
        res.status(500).send('Error al ordenar productos');
    }
};

module.exports = {
    getAllProducts,
    addProduct,
    deleteProduct,
    filterProducts,
    sortProducts,
};
