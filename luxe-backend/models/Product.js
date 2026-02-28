const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    id: { type: Number, unique: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    category: String,
    img: String,
    desc: String,
    stock: { type: Number, default: 100 }  // ← NUEVO: stock por defecto 100
});

module.exports = mongoose.model('Product', productSchema);