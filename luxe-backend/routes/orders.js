const express = require('express');
const jwt = require('jsonwebtoken');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const router = express.Router();

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

// Crear pedido desde el carrito
router.post('/create', verificarToken, async (req, res) => {
    try {
        const { direccion, metodoPago } = req.body;
        
        const carrito = await Cart.findOne({ userId: req.userId });
        if (!carrito || carrito.productos.length === 0) {
            return res.status(400).json({ error: 'El carrito está vacío' });
        }
        
        const nuevoPedido = new Order({
            userId: req.userId,
            correo: req.body.correo,
            cliente: req.body.cliente,
            direccion,
            productos: carrito.productos.map(p => ({
                nombre: p.nombre,
                precio: p.precio,
                cantidad: p.cantidad
            })),
            total: carrito.total,
            metodoPago
        });
        
        await nuevoPedido.save();
        
        // Vaciar carrito
        carrito.productos = [];
        carrito.total = 0;
        await carrito.save();
        
        res.json(nuevoPedido);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Obtener pedidos del usuario
router.get('/', verificarToken, async (req, res) => {
    try {
        const pedidos = await Order.find({ userId: req.userId }).sort({ fecha: -1 });
        res.json(pedidos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;