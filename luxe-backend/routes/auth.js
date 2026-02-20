const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Registro
router.post('/register', async (req, res) => {
    try {
        const { nombre, correo, telefono, contraseña } = req.body;
        
        const existeUsuario = await User.findOne({ correo });
        if (existeUsuario) {
            return res.status(400).json({ error: 'El correo ya está registrado' });
        }
        
        const salt = await bcrypt.genSalt(10);
        const contraseñaEncriptada = await bcrypt.hash(contraseña, salt);
        
        const nuevoUsuario = new User({
            nombre,
            correo,
            telefono,
            contraseña: contraseñaEncriptada,
            role: correo === 'admin@tienda.com' ? 'admin' : 'cliente'
        });
        
        await nuevoUsuario.save();
        
        const token = jwt.sign(
            { id: nuevoUsuario._id, role: nuevoUsuario.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        res.json({
            token,
            user: {
                id: nuevoUsuario._id,
                nombre: nuevoUsuario.nombre,
                correo: nuevoUsuario.correo,
                role: nuevoUsuario.role
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { correo, nombre } = req.body;
        
        const usuario = await User.findOne({ correo });
        if (!usuario) {
            return res.status(400).json({ error: 'Usuario no encontrado' });
        }
        
        const token = jwt.sign(
            { id: usuario._id, role: usuario.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        res.json({
            token,
            user: {
                id: usuario._id,
                nombre: usuario.nombre,
                correo: usuario.correo,
                role: usuario.role
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Obtener perfil
router.get('/perfil', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ error: 'No autorizado' });
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const usuario = await User.findById(decoded.id).select('-contraseña');
        
        res.json(usuario);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Actualizar perfil
router.put('/perfil', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ error: 'No autorizado' });
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { nombre, direccion, tarjeta } = req.body;
        
        const usuario = await User.findByIdAndUpdate(
            decoded.id,
            { nombre, direccion, tarjeta },
            { new: true }
        ).select('-contraseña');
        
        res.json(usuario);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;