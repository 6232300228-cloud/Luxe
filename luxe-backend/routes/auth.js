const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { sendVerificationEmail, sendLoginAlert, sendWelcomeEmail } = require('../services/emailService');

const router = express.Router();

// ============================================
// REGISTRO DE USUARIO (CON VERIFICACIÓN DE EMAIL)
// ============================================
router.post('/register', async (req, res) => {
    try {
        const { nombre, correo, telefono, direccion, contraseña } = req.body;

        // Verificar si el usuario ya existe
        const existeUsuario = await User.findOne({ correo });
        if (existeUsuario) {
            return res.status(400).json({ error: '❌ El correo ya está registrado' });
        }

        // Generar token de verificación (único y aleatorio)
        const verificationToken = crypto.randomBytes(32).toString('hex');

        // Encriptar contraseña
        const salt = await bcrypt.genSalt(10);
        const contraseñaEncriptada = await bcrypt.hash(contraseña, salt);

        // Crear usuario con token de verificación
        const nuevoUsuario = new User({
            nombre,
            correo,
            telefono,
            direccion,
            contraseña: contraseñaEncriptada,
            verificationToken,
            verified: false,
            role: correo === 'admin@luxe.com' ? 'admin' : 'cliente'
        });

        await nuevoUsuario.save();

        // Enviar correo de verificación
        await sendVerificationEmail(correo, nombre, verificationToken);

        res.json({ 
            mensaje: '✅ Usuario registrado. Por favor revisa tu correo para verificar tu cuenta.' 
        });

    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ============================================
// VERIFICAR EMAIL (cuando hacen clic en el enlace)
// ============================================
router.get('/verify-email', async (req, res) => {
    try {
        const { token } = req.query;

        const usuario = await User.findOne({ verificationToken: token });
        if (!usuario) {
            return res.status(400).send(`
                <html>
                    <head><title>Error de verificación</title></head>
                    <body style="font-family: Arial; text-align: center; padding: 50px;">
                        <h1 style="color: #ff4d6d;">❌ Error de verificación</h1>
                        <p>El enlace de verificación es inválido o ha expirado.</p>
                        <a href="http://localhost:5500/login.html" 
                           style="background-color: #ff4d6d; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                            Ir a iniciar sesión
                        </a>
                    </body>
                </html>
            `);
        }

        // Actualizar usuario
        usuario.verified = true;
        usuario.verificationToken = undefined;
        await usuario.save();

        // Enviar correo de bienvenida
        await sendWelcomeEmail(usuario.correo, usuario.nombre);

        // Mostrar página de éxito
        res.send(`
            <html>
                <head><title>¡Email verificado!</title></head>
                <body style="font-family: Arial; text-align: center; padding: 50px;">
                    <h1 style="color: #ff4d6d;">✅ ¡Email verificado exitosamente!</h1>
                    <p>Ya puedes iniciar sesión en Luxe.</p>
                    <a href="http://localhost:5500/login.html" 
                       style="background-color: #ff4d6d; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                        Ir a iniciar sesión
                    </a>
                </body>
            </html>
        `);

    } catch (error) {
        console.error('Error en verificación:', error);
        res.status(500).send('Error interno del servidor');
    }
});

// ============================================
// LOGIN CON VALIDACIÓN Y ALERTA
// ============================================
router.post('/login', async (req, res) => {
    try {
        const { correo, contraseña } = req.body;

        // Buscar usuario
        const usuario = await User.findOne({ correo });

        // Validar existencia
        if (!usuario) {
            return res.status(401).json({ error: '❌ Correo no registrado' });
        }

        // Validar verificación de email
        if (!usuario.verified) {
            return res.status(401).json({ 
                error: '❌ Por favor verifica tu correo electrónico antes de iniciar sesión. Revisa tu bandeja de entrada.' 
            });
        }

        // Validar contraseña
        const contraseñaValida = await bcrypt.compare(contraseña, usuario.contraseña);
        if (!contraseñaValida) {
            return res.status(401).json({ error: '❌ Contraseña incorrecta' });
        }

        // Generar token JWT
        const token = jwt.sign(
            { id: usuario._id, role: usuario.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Enviar alerta de inicio de sesión (en segundo plano)
        sendLoginAlert(usuario.correo, usuario.nombre).catch(err => 
            console.log('Error enviando alerta:', err)
        );

        // Respuesta exitosa
        res.json({
            token,
            user: {
                id: usuario._id,
                nombre: usuario.nombre,
                correo: usuario.correo,
                role: usuario.role,
                direccion: usuario.direccion || ''
            }
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ============================================
// REENVIAR CORREO DE VERIFICACIÓN
// ============================================
router.post('/resend-verification', async (req, res) => {
    try {
        const { correo } = req.body;

        const usuario = await User.findOne({ correo });
        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        if (usuario.verified) {
            return res.status(400).json({ error: 'El usuario ya está verificado' });
        }

        // Generar nuevo token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        usuario.verificationToken = verificationToken;
        await usuario.save();

        // Reenviar correo
        await sendVerificationEmail(usuario.correo, usuario.nombre, verificationToken);

        res.json({ mensaje: '✅ Correo de verificación reenviado' });

    } catch (error) {
        console.error('Error reenviando:', error);
        res.status(500).json({ error: 'Error interno' });
    }
});

// ============================================
// RUTA PARA VER TODOS LOS USUARIOS (solo pruebas)
// ============================================
router.get('/usuarios', async (req, res) => {
    try {
        const usuarios = await User.find().select('-contraseña');
        res.json(usuarios);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;