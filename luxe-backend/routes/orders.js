const express = require('express');
const jwt = require('jsonwebtoken');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const User = require('../models/User');

const router = express.Router();

// Middleware para verificar token
const verificarToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: '❌ No autorizado' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.usuarioId = decoded.id;
        next();
    } catch (error) {
        return res.status(401).json({ error: '❌ Token inválido' });
    }
};

// ============================================
// CREAR UN NUEVO PEDIDO DESDE EL CARRITO
// ============================================
router.post('/crear', verificarToken, async (req, res) => {
    try {
        const { metodoPago, direccionEntrega, notas } = req.body;
        const usuarioId = req.usuarioId;

        // 1. Obtener el carrito del usuario
        const carrito = await Cart.findOne({ usuarioId });
        
        if (!carrito || carrito.productos.length === 0) {
            return res.status(400).json({ error: '❌ El carrito está vacío' });
        }

        // 2. Obtener datos del usuario
        const usuario = await User.findById(usuarioId);
        if (!usuario) {
            return res.status(404).json({ error: '❌ Usuario no encontrado' });
        }

        // 3. Calcular total
        const total = carrito.productos.reduce((sum, item) => 
            sum + (item.precio * item.cantidad), 0
        );

        // 4. Crear el pedido
        const nuevoPedido = new Order({
            usuarioId: usuarioId,
            usuario: {
                nombre: usuario.nombre,
                correo: usuario.correo,
                direccion: direccionEntrega || usuario.direccion,
                telefono: usuario.telefono
            },
            productos: carrito.productos.map(item => ({
                productoId: item.productoId,
                nombre: item.nombre,
                precio: item.precio,
                cantidad: item.cantidad,
                imagen: item.imagen
            })),
            total: total,
            metodoPago: metodoPago,
            estado: 'pagado', // Asumimos que el pago fue exitoso
            notas: notas || '',
            fechaPedido: new Date()
        });

        await nuevoPedido.save();

        // 5. Vaciar el carrito después de la compra
        carrito.productos = [];
        carrito.total = 0;
        await carrito.save();

        // 6. Respuesta exitosa
        res.status(201).json({
            mensaje: '✅ Pedido creado exitosamente',
            pedido: {
                id: nuevoPedido._id,
                total: nuevoPedido.total,
                fecha: nuevoPedido.fechaPedido,
                estado: nuevoPedido.estado
            }
        });

    } catch (error) {
        console.error('Error creando pedido:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ============================================
// OBTENER TODOS LOS PEDIDOS DEL USUARIO
// ============================================
router.get('/mis-pedidos', verificarToken, async (req, res) => {
    try {
        const pedidos = await Order.find({ usuarioId: req.usuarioId })
            .sort({ fechaPedido: -1 }); // Más recientes primero

        res.json(pedidos);
    } catch (error) {
        console.error('Error obteniendo pedidos:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ============================================
// OBTENER UN PEDIDO ESPECÍFICO
// ============================================
router.get('/:pedidoId', verificarToken, async (req, res) => {
    try {
        const pedido = await Order.findOne({
            _id: req.params.pedidoId,
            usuarioId: req.usuarioId
        });

        if (!pedido) {
            return res.status(404).json({ error: '❌ Pedido no encontrado' });
        }

        res.json(pedido);
    } catch (error) {
        console.error('Error obteniendo pedido:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ============================================
// CANCELAR UN PEDIDO (si está pendiente)
// ============================================
router.put('/cancelar/:pedidoId', verificarToken, async (req, res) => {
    try {
        const pedido = await Order.findOne({
            _id: req.params.pedidoId,
            usuarioId: req.usuarioId
        });

        if (!pedido) {
            return res.status(404).json({ error: '❌ Pedido no encontrado' });
        }

        // Solo se pueden cancelar pedidos pendientes
        if (pedido.estado !== 'pendiente') {
            return res.status(400).json({ 
                error: '❌ No se puede cancelar un pedido que ya fue procesado' 
            });
        }

        pedido.estado = 'cancelado';
        await pedido.save();

        res.json({ 
            mensaje: '✅ Pedido cancelado exitosamente',
            pedido: pedido
        });

    } catch (error) {
        console.error('Error cancelando pedido:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

module.exports = router;