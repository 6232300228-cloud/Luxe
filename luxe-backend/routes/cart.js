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
        req.usuarioId = decoded.id;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Token inválido' });
    }
};

// ============================================
// OBTENER CARRITO DEL USUARIO
// ============================================
router.get('/', verificarToken, async (req, res) => {
    try {
        let carrito = await Cart.findOne({ usuarioId: req.usuarioId });
        if (!carrito) {
            carrito = new Cart({ 
                usuarioId: req.usuarioId, 
                productos: [], 
                total: 0 
            });
            await carrito.save();
        }
        res.json(carrito);
    } catch (error) {
        console.error('Error obteniendo carrito:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ============================================
// AGREGAR PRODUCTO AL CARRITO
// ============================================
router.post('/agregar', verificarToken, async (req, res) => {
    try {
        const { productoId, nombre, precio, cantidad, imagen } = req.body;
        
        // Buscar o crear carrito
        let carrito = await Cart.findOne({ usuarioId: req.usuarioId });
        if (!carrito) {
            carrito = new Cart({ 
                usuarioId: req.usuarioId, 
                productos: [] 
            });
        }
        
        // Verificar si el producto ya existe
        const existeProducto = carrito.productos.find(p => p.productoId.toString() === productoId);
        
        if (existeProducto) {
            // Actualizar cantidad
            existeProducto.cantidad += cantidad || 1;
        } else {
            // Agregar nuevo producto
            carrito.productos.push({
                productoId,
                nombre,
                precio,
                cantidad: cantidad || 1,
                imagen
            });
        }
        
        // Calcular total
        carrito.total = carrito.productos.reduce((sum, p) => sum + (p.precio * p.cantidad), 0);
        
        await carrito.save();
        res.json(carrito);
        
    } catch (error) {
        console.error('Error agregando al carrito:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ============================================
// ACTUALIZAR CANTIDAD DE UN PRODUCTO
// ============================================
router.put('/actualizar/:productoId', verificarToken, async (req, res) => {
    try {
        const { cantidad } = req.body;
        const carrito = await Cart.findOne({ usuarioId: req.usuarioId });
        
        if (!carrito) {
            return res.status(404).json({ error: 'Carrito no encontrado' });
        }
        
        const producto = carrito.productos.find(p => p._id.toString() === req.params.productoId);
        if (!producto) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        
        producto.cantidad = cantidad;
        
        // Recalcular total
        carrito.total = carrito.productos.reduce((sum, p) => sum + (p.precio * p.cantidad), 0);
        
        await carrito.save();
        res.json(carrito);
        
    } catch (error) {
        console.error('Error actualizando carrito:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ============================================
// ELIMINAR PRODUCTO DEL CARRITO
// ============================================
router.delete('/eliminar/:productoId', verificarToken, async (req, res) => {
    try {
        const carrito = await Cart.findOne({ usuarioId: req.usuarioId });
        
        if (!carrito) {
            return res.status(404).json({ error: 'Carrito no encontrado' });
        }
        
        // Filtrar el producto a eliminar
        carrito.productos = carrito.productos.filter(p => p._id.toString() !== req.params.productoId);
        
        // Recalcular total
        carrito.total = carrito.productos.reduce((sum, p) => sum + (p.precio * p.cantidad), 0);
        
        await carrito.save();
        res.json(carrito);
        
    } catch (error) {
        console.error('Error eliminando del carrito:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ============================================
// VACIAR CARRITO COMPLETO
// ============================================
router.delete('/vaciar', verificarToken, async (req, res) => {
    try {
        const carrito = await Cart.findOne({ usuarioId: req.usuarioId });
        
        if (carrito) {
            carrito.productos = [];
            carrito.total = 0;
            await carrito.save();
        }
        
        res.json({ mensaje: '✅ Carrito vaciado' });
        
    } catch (error) {
        console.error('Error vaciando carrito:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

module.exports = router;