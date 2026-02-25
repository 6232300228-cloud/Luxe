// services/emailService.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'TU_CORREO@gmail.com',
        pass: 'abcd efgh ijkl mnop'  // Tu contraseña de aplicación
    }
});

// ✅ Verificar conexión
transporter.verify((error, success) => {
    if (error) console.log('❌ Error conectando con Gmail:', error);
    else console.log('✅ Servicio de correos listo para enviar');
});

// ✅ Enviar correo de verificación (DEBE ESTAR EXPORTADA)
const sendVerificationEmail = async (email, nombre, token) => {
    try {
        const verificationLink = `http://localhost:3000/api/auth/verify-email?token=${token}`;
        
        const mailOptions = {
            from: '"Luxe Beauty" <TU_CORREO@gmail.com>',
            to: email,
            subject: 'Confirma tu cuenta en Luxe ✨',
            html: `<h1>Bienvenido ${nombre}</h1><p>Haz clic <a href="${verificationLink}">aquí</a> para confirmar tu cuenta.</p>`
        };
        
        await transporter.sendMail(mailOptions);
        console.log(`✅ Correo de verificación enviado a ${email}`);
    } catch (error) {
        console.error('❌ Error enviando verificación:', error);
    }
};

// ✅ Enviar alerta de inicio de sesión (DEBE ESTAR EXPORTADA)
const sendLoginAlert = async (email, nombre) => {
    try {
        const fecha = new Date().toLocaleString();
        
        const mailOptions = {
            from: '"Luxe Beauty" <TU_CORREO@gmail.com>',
            to: email,
            subject: '🔐 Nuevo inicio de sesión en Luxe',
            html: `<h1>Hola ${nombre}</h1><p>Se ha iniciado sesión en tu cuenta el ${fecha}.</p><p>Si no fuiste tú, cambia tu contraseña.</p>`
        };
        
        await transporter.sendMail(mailOptions);
        console.log(`✅ Alerta de login enviada a ${email}`);
    } catch (error) {
        console.error('❌ Error enviando alerta:', error);
    }
};

// ✅ Enviar correo de bienvenida (DEBE ESTAR EXPORTADA)
const sendWelcomeEmail = async (email, nombre) => {
    try {
        const mailOptions = {
            from: '"Luxe Beauty" <TU_CORREO@gmail.com>',
            to: email,
            subject: '🎉 ¡Bienvenid@ a Luxe!',
            html: `<h1>¡Gracias por unirte, ${nombre}!</h1><p>Ya puedes disfrutar de todos nuestros productos.</p>`
        };
        
        await transporter.sendMail(mailOptions);
        console.log(`✅ Correo de bienvenida enviado a ${email}`);
    } catch (error) {
        console.error('❌ Error enviando bienvenida:', error);
    }
};

// ✅ EXPORTAR TODAS LAS FUNCIONES
module.exports = {
    sendVerificationEmail,
    sendLoginAlert,
    sendWelcomeEmail
};