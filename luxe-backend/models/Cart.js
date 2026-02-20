const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    productos: [{
        productoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        nombre: String,
        precio: Number,
        img: String,
        cantidad: Number
    }],
    total: Number,
    fechaActualizacion: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Cart', cartSchema);