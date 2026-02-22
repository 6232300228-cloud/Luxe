// services/emailService.js
const nodemailer = require('nodemailer');

// Configuración del transporter (usando Gmail)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'tiendaluxeedb@gmail.com',      // ← CAMBIA ESTO POR TU CORREO
        pass: 'gzfi inau tpos oppf'        // ← PEGA AQUÍ LA CONTRASEÑA DE 16 DÍGITOS
    }
});

// Verificar conexión
transporter.verify((error, success) => {
    if (error) {
        console.log('❌ Error conectando con Gmail:', error);
    } else {
        console.log('✅ Servicio de correos listo para enviar');
    }
});

// Enviar correo de verificación
const sendVerificationEmail = async (email, nombre, token) => {
    const verificationLink = `http://localhost:3000/api/auth/verify-email?token=${token}`;
    
    const mailOptions = {
        from: '"Luxe Beauty" <TU_CORREO@gmail.com>',
        to: email,
        subject: 'Confirma tu cuenta en Luxe ✨',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ffc8dd; border-radius: 10px;">
                <h1 style="color: #ff4d6d; text-align: center;">¡Bienvenid@ a Luxe, ${nombre}!</h1>
                
                <p style="font-size: 16px; color: #333; line-height: 1.5;">
                    Por favor confirma tu correo electrónico haciendo clic en el siguiente enlace:
                </p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${verificationLink}" 
                       style="background-color: #ff4d6d; 
                              color: white; 
                              padding: 15px 30px; 
                              text-decoration: none; 
                              border-radius: 25px;
                              font-weight: bold;
                              display: inline-block;">
                        Confirmar mi cuenta
                    </a>
                </div>
            </div>
        `
    };
    
    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Correo de verificación enviado a ${email}`);
    } catch (error) {
        console.error('❌ Error enviando correo:', error);
        throw error;
    }
};

module.exports = {
    sendVerificationEmail
};