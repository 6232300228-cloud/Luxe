const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    correo: String,
    cliente: String,
    direccion: String,
    productos: [{
        nombre: String,
        precio: Number,
        cantidad: Number
    }],
    total: Number,
    metodoPago: String,
    estado: { type: String, default: 'pagado' },
    fecha: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);