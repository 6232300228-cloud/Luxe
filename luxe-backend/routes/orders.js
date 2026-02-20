const express = require('express');
const router = express.Router();

// Ruta de prueba para pedidos
router.get('/', (req, res) => {
    res.json({ mensaje: 'Ruta de pedidos funcionando' });
});

// Crear un pedido
router.post('/', (req, res) => {
    res.json({ mensaje: 'Pedido creado' });
});

module.exports = router;