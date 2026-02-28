const express = require('express');
const jwt = require('jsonwebtoken');
const Order = require('../models/Order');
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
// CREAR UN NUEVO PEDIDO (RECIBE PRODUCTOS DEL FRONTEND)
// ============================================
router.post('/crear', verificarToken, async (req, res) => {
    try {
        const { usuario, productos, total, metodoPago, fecha, estado } = req.body;
        const usuarioId = req.usuarioId;

        // Validaciones básicas
        if (!productos || productos.length === 0) {
            return res.status(400).json({ error: '❌ El pedido no tiene productos' });
        }

        if (!usuario || !usuario.direccion) {
            return res.status(400).json({ error: '❌ Falta dirección de envío' });
        }

        console.log('📥 Recibiendo pedido:', { usuarioId, productos, total });

        // Crear el pedido directamente con los datos recibidos
        const nuevoPedido = new Order({
            usuarioId: usuarioId,
            usuario: {
                nombre: usuario.nombre,
                correo: usuario.correo,
                direccion: usuario.direccion
            },
            productos: productos.map(item => ({
                nombre: item.nombre,
                precio: item.precio,
                cantidad: item.cantidad,
                imagen: item.imagen || ''
            })),
            total: total,
            metodoPago: metodoPago,
            estado: 'pagado',
            fechaPedido: new Date()
        });

        await nuevoPedido.save();

        console.log('✅ Pedido guardado con ID:', nuevoPedido._id);

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
        console.error('❌ Error creando pedido:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ============================================
// OBTENER TODOS LOS PEDIDOS DEL USUARIO
// ============================================
router.get('/mis-pedidos', verificarToken, async (req, res) => {
    try {
        const pedidos = await Order.find({ usuarioId: req.usuarioId })
            .sort({ fechaPedido: -1 });

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

module.exports = router;