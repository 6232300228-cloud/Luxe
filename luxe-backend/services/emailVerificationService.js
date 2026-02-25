// services/emailVerificationService.js
const axios = require('axios');

// Tu API Key de Abstract (cámbiala por la tuya)
const ABSTRACT_API_KEY = 'cd3e5fa4d9e84f32819070841a44da43';

/**
 * Verifica si un email realmente existe usando Abstract API
 * @param {string} email - El correo a verificar
 * @returns {Promise<{valido: boolean, mensaje: string, data: object}>}
 */
const verificarEmail = async (email) => {
    try {
        // Llamar a la API de Abstract
        const response = await axios.get('https://emailvalidation.abstractapi.com/v1/', {
            params: {
                api_key: ABSTRACT_API_KEY,
                email: email
            }
        });

        const data = response.data;
        console.log('📧 Respuesta de Abstract:', data); // Para depuración

        // La API devuelve varios campos útiles [citation:2]
        const resultado = {
            valido: false,
            mensaje: '',
            data: data,
            // Campos específicos que nos interesan
            formato_valido: data.is_valid_format?.value || false,
            dominio_valido: data.is_mx_found?.value || false,
            smtp_valido: data.is_smtp_valid?.value || false,
            es_desechable: data.is_disposable_email?.value || false,
            calidad: data.quality_score || 0,
            entregable: data.deliverability || 'UNKNOWN'
        };

        // Lógica de decisión: ¿consideramos el email válido?
        if (data.deliverability === 'DELIVERABLE') {
            resultado.valido = true;
            resultado.mensaje = '✅ Email válido y entregable';
        } 
        else if (data.deliverability === 'RISKY') {
            resultado.valido = false;
            resultado.mensaje = '⚠️ Email riesgoso (podría rebotar)';
        }
        else if (data.deliverability === 'UNDELIVERABLE') {
            resultado.valido = false;
            resultado.mensaje = '❌ El email no existe o no es entregable';
        }
        else if (!data.is_valid_format?.value) {
            resultado.valido = false;
            resultado.mensaje = '❌ Formato de correo inválido';
        }
        else if (data.is_disposable_email?.value) {
            resultado.valido = false;
            resultado.mensaje = '❌ No se permiten correos desechables (temporales)';
        }
        else {
            resultado.valido = false;
            resultado.mensaje = '❌ No se pudo verificar el email';
        }

        return resultado;

    } catch (error) {
        console.error('Error verificando email:', error.response?.data || error.message);
        return {
            valido: false,
            mensaje: '❌ Error en el servicio de verificación',
            data: null
        };
    }
};

module.exports = { verificarEmail };