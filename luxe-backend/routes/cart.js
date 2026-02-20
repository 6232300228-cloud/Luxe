const express = require('express');
const jwt = require('jsonwebtoken');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const router = express.Router();

// Middleware para verificar token
const verificarToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No autorizado' });
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Token inválido' });
    }
};

// Obtener carrito del usuario
router.get('/', verificarToken, async (req, res) => {
    try {
        let carrito = await Cart.findOne({ userId: req.userId });
        if (!carrito) {
            carrito = new Cart({ userId: req.userId, productos: [], total: 0 });
            await carrito.save();
        }
        res.json(carrito);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Agregar producto al carrito
router.post('/add', verificarToken, async (req, res) => {
    try {
        const { productoId, cantidad } = req.body;
        
        const producto = await Product.findOne({ id: productoId });
        if (!producto) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        
        let carrito = await Cart.findOne({ userId: req.userId });
        if (!carrito) {
            carrito = new Cart({ userId: req.userId, productos: [], total: 0 });
        }
        
        const existeProducto = carrito.productos.find(
            p => p.productoId.toString() === producto._id.toString()
        );
        
        if (existeProducto) {
            existeProducto.cantidad += cantidad;
        } else {
            carrito.productos.push({
                productoId: producto._id,
                nombre: producto.name,
                precio: producto.price,
                img: producto.img,
                cantidad
            });
        }
        
        // Calcular total
        carrito.total = carrito.productos.reduce((sum, p) => sum + (p.precio * p.cantidad), 0);
        
        await carrito.save();
        res.json(carrito);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Actualizar cantidad
router.put('/update/:productoId', verificarToken, async (req, res) => {
    try {
        const { cantidad } = req.body;
        const { productoId } = req.params;
        
        const carrito = await Cart.findOne({ userId: req.userId });
        if (!carrito) return res.status(404).json({ error: 'Carrito no encontrado' });
        
        const producto = carrito.productos.find(p => p._id.toString() === productoId);
        if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
        
        producto.cantidad = cantidad;
        
        carrito.total = carrito.productos.reduce((sum, p) => sum + (p.precio * p.cantidad), 0);
        await carrito.save();
        
        res.json(carrito);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Eliminar producto del carrito
router.delete('/remove/:productoId', verificarToken, async (req, res) => {
    try {
        const { productoId } = req.params;
        
        const carrito = await Cart.findOne({ userId: req.userId });
        if (!carrito) return res.status(404).json({ error: 'Carrito no encontrado' });
        
        carrito.productos = carrito.productos.filter(p => p._id.toString() !== productoId);
        
        carrito.total = carrito.productos.reduce((sum, p) => sum + (p.precio * p.cantidad), 0);
        await carrito.save();
        
        res.json(carrito);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;