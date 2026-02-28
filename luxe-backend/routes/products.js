const express = require('express');
const Product = require('../models/Product');
const router = express.Router();

// RUTA 1: Obtener todos los productos (GET)
router.get('/', async (req, res) => {
    try {
        const productos = await Product.find();
        res.json(productos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// RUTA 2: Cargar productos iniciales (POST) - ¡PRIMERO LAS RUTAS ESPECÍFICAS!
router.post('/seed', async (req, res) => {
    try {
        const productosIniciales = [
            { id:1, name:"Labial Cremoso Soft Matte", price:250, category:"labial", img:"img/labial.webp", desc:"Labial suave, matte y de larga duración." },
            { id:2, name:"Ultimate Shadow Palette", price:400, category:"sombra", img:"img/paletas.png", desc:"Paleta profesional con tonos increíbles." },
            { id:3, name:"Can't Stop Foundation", price:350, category:"base", img:"img/base.png", desc:"Base resistente todo el día." },
            { id:4, name:"HD Photogenic Concealer", price:280, category:"corrector", img:"img/corrector.png", desc:"Corrector de alta cobertura y acabado natural." },
            { id:5, name:"Delineador negro waterproof", price:95, category:"ojos", img:"img/delineador.png", desc:"Delineador de alta duración." },
            { id:6, name:"Mascara Lash Sensational", price:180, category:"ojos", img:"img/rimel.png", desc:"Volumen definido." },
            { id:7, name:"Labial Glossy Rosa", price:120, category:"labial", img:"img/labial2.png", desc:"Brillo labial hidratante." },
            { id:8, name:"Set de Brochas Luxe", price:350, category:"accesorios", img:"img/brochas.png", desc:"Set profesional." },
            { id:9, name:"Iluminador Perla Glow", price:210, category:"rostro", img:"img/iluminador.png", desc:"Brillo natural elegante." }
        ];
        
        // Borrar productos existentes y cargar nuevos
        await Product.deleteMany({});
        await Product.insertMany(productosIniciales);
        
        res.json({ mensaje: '✅ Productos cargados exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// RUTA 3: Obtener producto por ID (GET) - ¡DESPUÉS de las rutas específicas!
router.get('/:id', async (req, res) => {
    try {
        const producto = await Product.findOne({ id: req.params.id });
        if (!producto) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        res.json(producto);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;




// REDUCIR STOCK (cuando se vende)
router.put('/reducir-stock/:productoId', verificarToken, async (req, res) => {
    try {
        const { cantidad } = req.body;
        const producto = await Product.findOne({ id: req.params.productoId });
        
        if (!producto) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        
        if (producto.stock < cantidad) {
            return res.status(400).json({ error: 'Stock insuficiente' });
        }
        
        producto.stock -= cantidad;
        await producto.save();
        
        res.json({ 
            mensaje: '✅ Stock actualizado', 
            nuevoStock: producto.stock 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});