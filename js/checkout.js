// ============================================
// CHECKOUT.JS - CON MERCADO PAGO
// ============================================

// Variables globales
let carrito = [];
let total = 0;
let pasoActual = 1; // 1: Envío, 2: Pago, 3: Confirmar

// ============================================
// INICIALIZACIÓN
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    // Cargar carrito del localStorage
    cargarCarrito();
    
    // Actualizar resumen
    actualizarResumen();
    
    // Configurar eventos
    document.getElementById('btnContinuar').addEventListener('click', avanzarPaso);
    document.getElementById('btnPagar').addEventListener('click', procesarPago);
    
    // Eventos para métodos de pago
    const radioTarjeta = document.querySelector('input[value="tarjeta"]');
    const radioPaypal = document.querySelector('input[value="paypal"]');
    
    radioTarjeta.addEventListener('change', function() {
        document.getElementById('tarjetaBox').classList.remove('hidden');
        document.getElementById('paypalBox').classList.add('hidden');
    });
    
    radioPaypal.addEventListener('change', function() {
        document.getElementById('tarjetaBox').classList.add('hidden');
        document.getElementById('paypalBox').classList.remove('hidden');
    });
    
    // Formatear número de tarjeta mientras se escribe
    const numeroTarjeta = document.getElementById('numeroTarjeta');
    if (numeroTarjeta) {
        numeroTarjeta.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 16) value = value.slice(0, 16);
            value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
            e.target.value = value;
        });
    }
    
    // Formatear fecha de expiración
    const expira = document.getElementById('expira');
    if (expira) {
        expira.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.slice(0, 2) + '/' + value.slice(2, 4);
            }
            e.target.value = value;
        });
    }
    
    // Cargar datos del usuario si está logueado
    cargarDatosUsuario();
    
    // Actualizar contador del carrito
    actualizarContadorCarrito();
});

// ============================================
// CARGAR CARRITO DEL LOCALSTORAGE
// ============================================
function cargarCarrito() {
    const carritoGuardado = localStorage.getItem('carrito');
    if (carritoGuardado) {
        carrito = JSON.parse(carritoGuardado);
        calcularTotal();
    }
}

// ============================================
// CALCULAR TOTAL DEL CARRITO
// ============================================
function calcularTotal() {
    total = 0;
    carrito.forEach(item => {
        total += (item.precio * (item.cantidad || 1));
    });
}

// ============================================
// ACTUALIZAR RESUMEN DE COMPRA
// ============================================
function actualizarResumen() {
    const subtotal = total;
    const envio = subtotal >= 1000 ? 0 : 99;
    const totalPagar = subtotal + envio;
    
    document.getElementById('resumen-subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('resumen-envio').textContent = envio === 0 ? 'GRATIS' : `$${envio.toFixed(2)}`;
    document.getElementById('resumen-total').textContent = `$${totalPagar.toFixed(2)}`;
}

// ============================================
// AVANZAR ENTRE PASOS
// ============================================
function avanzarPaso() {
    if (pasoActual === 1) {
        // Validar datos de envío
        const nombre = document.getElementById('nombre').value.trim();
        const direccion = document.getElementById('direccion').value.trim();
        const correo = document.getElementById('correo').value.trim();
        
        if (!nombre || !direccion || !correo) {
            mostrarToast('Por favor, completa todos los campos de envío', 'error');
            return;
        }
        
        if (!correo.includes('@')) {
            mostrarToast('Por favor, ingresa un correo válido', 'error');
            return;
        }
        
        // Guardar datos de envío
        guardarDatosEnvio(nombre, direccion, correo);
        
        // Avanzar al paso 2
        pasoActual = 2;
        actualizarBarraProgreso();
        
        // Ocultar sección de envío, mostrar sección de pago
        document.getElementById('shipping-section').style.display = 'none';
        document.getElementById('payment-section').style.display = 'block';
        document.getElementById('btnContinuar').style.display = 'none';
        document.getElementById('btnPagar').style.display = 'block';
        
        // Scroll suave al inicio
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
    } else if (pasoActual === 2) {
        // Validar método de pago seleccionado
        const metodoPago = document.querySelector('input[name="metodoPago"]:checked').value;
        
        if (metodoPago === 'tarjeta') {
            const numeroTarjeta = document.getElementById('numeroTarjeta').value.replace(/\s/g, '');
            const expira = document.getElementById('expira').value;
            const cvv = document.getElementById('cvvTarjeta').value;
            
            if (!numeroTarjeta || numeroTarjeta.length < 16) {
                mostrarToast('Por favor, ingresa un número de tarjeta válido', 'error');
                return;
            }
            if (!expira || expira.length < 5) {
                mostrarToast('Por favor, ingresa la fecha de expiración (MM/AA)', 'error');
                return;
            }
            if (!cvv || cvv.length < 3) {
                mostrarToast('Por favor, ingresa el CVV', 'error');
                return;
            }
        } else if (metodoPago === 'paypal') {
            const correoPaypal = document.getElementById('correoPaypal').value.trim();
            if (!correoPaypal || !correoPaypal.includes('@')) {
                mostrarToast('Por favor, ingresa un correo de PayPal válido', 'error');
                return;
            }
        }
        
        // Avanzar al paso 3 (confirmación)
        pasoActual = 3;
        actualizarBarraProgreso();
        
        // Mostrar confirmación
        mostrarConfirmacion();
    }
}

// ============================================
// ACTUALIZAR BARRA DE PROGRESO
// ============================================
function actualizarBarraProgreso() {
    const steps = document.querySelectorAll('.progress-step');
    const lines = document.querySelectorAll('.progress-line');
    
    steps.forEach((step, index) => {
        if (index + 1 <= pasoActual) {
            step.classList.add('active');
        } else {
            step.classList.remove('active');
        }
    });
    
    lines.forEach((line, index) => {
        if (index + 1 < pasoActual) {
            line.style.background = '#ff4d6d';
        } else {
            line.style.background = '#f0f0f0';
        }
    });
}

// ============================================
// GUARDAR DATOS DE ENVÍO
// ============================================
function guardarDatosEnvio(nombre, direccion, correo) {
    localStorage.setItem('envio_nombre', nombre);
    localStorage.setItem('envio_direccion', direccion);
    localStorage.setItem('envio_correo', correo);
}

// ============================================
// PROCESAR PAGO CON MERCADO PAGO
// ============================================
async function procesarPago() {
    const metodoPago = document.querySelector('input[name="metodoPago"]:checked').value;
    
    // Mostrar loading
    const btnPagar = document.getElementById('btnPagar');
    const textoOriginal = btnPagar.textContent;
    btnPagar.textContent = 'Procesando...';
    btnPagar.disabled = true;
    
    try {
        // Preparar los items del carrito para Mercado Pago
        const items = carrito.map(item => ({
            nombre: item.nombre,
            precio: item.precio,
            cantidad: item.cantidad || 1
        }));
        
        // Obtener datos de envío
        const nombre = localStorage.getItem('envio_nombre') || '';
        const direccion = localStorage.getItem('envio_direccion') || '';
        const correo = localStorage.getItem('envio_correo') || '';
        
        // Llamar al endpoint de Mercado Pago
        const response = await fetch('https://luxe-api-frr5.onrender.com/api/crear-preferencia', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                items: items,
                payer: {
                    name: nombre,
                    email: correo,
                    address: direccion
                }
            })
        });
        
        const data = await response.json();
        
        if (data.init_point) {
            // Guardar información del pedido antes de redirigir
            guardarPedido();
            
            // Redirigir a Mercado Pago
            window.location.href = data.init_point;
        } else {
            mostrarToast('Error al procesar el pago. Intenta de nuevo.', 'error');
            btnPagar.textContent = textoOriginal;
            btnPagar.disabled = false;
        }
        
    } catch (error) {
        console.error('Error en el pago:', error);
        mostrarToast('Error de conexión. Verifica tu internet.', 'error');
        btnPagar.textContent = textoOriginal;
        btnPagar.disabled = false;
    }
}

// ============================================
// GUARDAR PEDIDO EN LOCALSTORAGE
// ============================================
function guardarPedido() {
    const nombre = localStorage.getItem('envio_nombre') || '';
    const direccion = localStorage.getItem('envio_direccion') || '';
    const correo = localStorage.getItem('envio_correo') || '';
    const metodoPago = document.querySelector('input[name="metodoPago"]:checked').value;
    
    const pedido = {
        id: Date.now(),
        fecha: new Date().toISOString(),
        items: carrito,
        subtotal: total,
        envio: total >= 1000 ? 0 : 99,
        total: total + (total >= 1000 ? 0 : 99),
        envioData: {
            nombre: nombre,
            direccion: direccion,
            correo: correo
        },
        metodoPago: metodoPago,
        estado: 'pendiente'
    };
    
    // Guardar en localStorage
    let pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
    pedidos.push(pedido);
    localStorage.setItem('pedidos', JSON.stringify(pedidos));
    
    // Limpiar carrito después de guardar el pedido
    localStorage.removeItem('carrito');
}

// ============================================
// MOSTRAR CONFIRMACIÓN (PASO 3)
// ============================================
function mostrarConfirmacion() {
    const checkoutCard = document.querySelector('.checkout-card');
    const nombre = localStorage.getItem('envio_nombre') || '';
    const direccion = localStorage.getItem('envio_direccion') || '';
    const metodoPago = document.querySelector('input[name="metodoPago"]:checked').value;
    const metodoTexto = metodoPago === 'tarjeta' ? 'Tarjeta de Crédito/Débito' : 'PayPal';
    
    checkoutCard.innerHTML = `
        <h2 class="checkout-title">Confirmar Pedido</h2>
        
        <div class="checkout-progress">
            <div class="progress-step active">
                <span class="step-number">1</span>
                <span class="step-label">Envío</span>
            </div>
            <div class="progress-line" style="background: #ff4d6d;"></div>
            <div class="progress-step active">
                <span class="step-number">2</span>
                <span class="step-label">Pago</span>
            </div>
            <div class="progress-line"></div>
            <div class="progress-step active">
                <span class="step-number">3</span>
                <span class="step-label">Confirmar</span>
            </div>
        </div>
        
        <div style="text-align: left; margin: 20px 0;">
            <h3 style="color: #ff4d6d;">Datos de Envío</h3>
            <p><strong>Nombre:</strong> ${nombre}</p>
            <p><strong>Dirección:</strong> ${direccion}</p>
            
            <h3 style="color: #ff4d6d; margin-top: 20px;">Método de Pago</h3>
            <p>${metodoTexto}</p>
        </div>
        
        <div class="checkout-summary">
            <h3>Resumen de compra</h3>
            <div class="summary-row">
                <span>Subtotal:</span>
                <span id="resumen-subtotal">$${total.toFixed(2)}</span>
            </div>
            <div class="summary-row">
                <span>Envío:</span>
                <span id="resumen-envio">${total >= 1000 ? 'GRATIS' : `$${(total >= 1000 ? 0 : 99).toFixed(2)}`}</span>
            </div>
            <div class="summary-divider"></div>
            <div class="summary-row total-row">
                <span>Total a Pagar:</span>
                <span id="resumen-total">$${(total + (total >= 1000 ? 0 : 99)).toFixed(2)}</span>
            </div>
        </div>
        
        <div class="checkout-actions">
            <button id="btnConfirmar" class="btn-luxe-pay">Confirmar y Pagar</button>
        </div>
        
        <p class="secure-text">🔒 Al confirmar, serás redirigido a la pasarela de pago segura</p>
    `;
    
    document.getElementById('btnConfirmar').addEventListener('click', procesarPago);
}

// ============================================
// CARGAR DATOS DEL USUARIO LOGUEADO
// ============================================
function cargarDatosUsuario() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        const nombreInput = document.getElementById('nombre');
        const correoInput = document.getElementById('correo');
        
        if (nombreInput && user.nombre) {
            nombreInput.value = user.nombre;
        }
        if (correoInput && user.correo) {
            correoInput.value = user.correo;
        }
    }
}

// ============================================
// ACTUALIZAR CONTADOR DEL CARRITO
// ============================================
function actualizarContadorCarrito() {
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
        const total = carrito.reduce((sum, item) => sum + (item.cantidad || 1), 0);
        cartCount.textContent = total;
    }
}

// ============================================
// MOSTRAR TOAST (MENSAJE FLOTANTE)
// ============================================
function mostrarToast(mensaje, tipo = 'success') {
    // Crear elemento toast si no existe
    let toast = document.getElementById('custom-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'custom-toast';
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: ${tipo === 'error' ? '#ff4d6d' : '#4caf50'};
            color: white;
            padding: 12px 24px;
            border-radius: 25px;
            font-size: 14px;
            z-index: 9999;
            animation: slideIn 0.3s ease;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        `;
        document.body.appendChild(toast);
        
        // Agregar animación CSS
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    toast.textContent = mensaje;
    toast.style.background = tipo === 'error' ? '#ff4d6d' : '#4caf50';
    toast.style.display = 'block';
    
    setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
}

// ============================================
// FUNCIÓN PARA SUSCRIBIRSE AL NEWSLETTER
// ============================================
function suscribirse() {
    const email = document.getElementById('newsletter-email')?.value;
    if (email && email.includes('@')) {
        mostrarToast('¡Bienvenida al Club Luxe!', 'success');
        document.getElementById('newsletter-email').value = '';
    } else {
        mostrarToast('Por favor, ingresa un email válido', 'error');
    }
}