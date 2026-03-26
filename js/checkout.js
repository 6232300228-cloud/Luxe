// ============================================
// CHECKOUT.JS - CON ENVÍO GRATIS > $500 Y BACKEND
// ============================================

// Variables globales
let carrito = [];
let total = 0;
let pasoActual = 1;
let userToken = null;

// Constantes de envío
const ENVIO_GRATIS_MINIMO = 500; // $500 para envío gratis
const COSTO_ENVIO = 50; // $50 si no alcanza

// ============================================
// INICIALIZACIÓN
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Checkout inicializado');
    
    // Obtener token del usuario si está logueado
    userToken = localStorage.getItem('token');
    console.log('Token de usuario:', userToken ? 'Sí hay token' : 'No hay token');
    
    // Cargar carrito
    cargarCarrito();
    actualizarResumen();
    
    // Configurar eventos de los botones
    const btnContinuar = document.getElementById('btnContinuar');
    const btnPagar = document.getElementById('btnPagar');
    
    if (btnContinuar) btnContinuar.addEventListener('click', avanzarPaso);
    if (btnPagar) btnPagar.addEventListener('click', procesarPago);
    
    // Eventos para los métodos de pago
    const radios = document.querySelectorAll('input[name="metodoPago"]');
    radios.forEach(radio => {
        radio.addEventListener('change', function() {
            document.getElementById('tarjetaBox')?.classList.add('hidden');
            document.getElementById('mercadopagoBox')?.classList.add('hidden');
            
            if (this.value === 'tarjeta') {
                document.getElementById('tarjetaBox')?.classList.remove('hidden');
            } else if (this.value === 'mercadopago') {
                document.getElementById('mercadopagoBox')?.classList.remove('hidden');
            }
        });
    });
    
    // Cargar datos del usuario
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        const nombreInput = document.getElementById('nombre');
        const correoInput = document.getElementById('correo');
        if (nombreInput && user.nombre) nombreInput.value = user.nombre;
        if (correoInput && user.correo) correoInput.value = user.correo;
    }
    
    // Actualizar contador del carrito
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        const carritoGuardado = JSON.parse(localStorage.getItem('carrito')) || [];
        const totalItems = carritoGuardado.reduce((sum, item) => sum + (item.cantidad || 1), 0);
        cartCount.textContent = totalItems;
    }
});

// ============================================
// CALCULAR COSTO DE ENVÍO
// ============================================
function calcularEnvio() {
    if (total >= ENVIO_GRATIS_MINIMO) {
        return 0;
    }
    return COSTO_ENVIO;
}

// ============================================
// ACTUALIZAR RESUMEN
// ============================================
function actualizarResumen() {
    const subtotal = total;
    const envio = calcularEnvio();
    const totalPagar = subtotal + envio;
    
    const subtotalEl = document.getElementById('resumen-subtotal');
    const envioEl = document.getElementById('resumen-envio');
    const totalEl = document.getElementById('resumen-total');
    
    if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    
    if (envioEl) {
        if (envio === 0) {
            envioEl.textContent = 'GRATIS 🎉';
            envioEl.style.color = '#4caf50';
        } else {
            envioEl.textContent = `$${envio.toFixed(2)}`;
            envioEl.style.color = '#666';
        }
    }
    
    if (totalEl) totalEl.textContent = `$${totalPagar.toFixed(2)}`;
    
    mostrarMensajeEnvio();
}

// ============================================
// MOSTRAR MENSAJE DE ENVÍO GRATIS
// ============================================
function mostrarMensajeEnvio() {
    let mensajeEnvio = document.getElementById('mensaje-envio-gratis');
    
    if (total < ENVIO_GRATIS_MINIMO) {
        const faltante = ENVIO_GRATIS_MINIMO - total;
        if (!mensajeEnvio) {
            const summary = document.querySelector('.checkout-summary');
            if (summary) {
                mensajeEnvio = document.createElement('div');
                mensajeEnvio.id = 'mensaje-envio-gratis';
                mensajeEnvio.style.cssText = `
                    background: #fff0f3;
                    padding: 10px;
                    border-radius: 10px;
                    margin-bottom: 15px;
                    font-size: 13px;
                    text-align: center;
                    color: #ff4d6d;
                `;
                summary.insertBefore(mensajeEnvio, summary.firstChild);
            }
        }
        if (mensajeEnvio) {
            mensajeEnvio.innerHTML = `💰 Agrega $${faltante.toFixed(2)} más para obtener <strong>ENVÍO GRATIS</strong> 🚚`;
            mensajeEnvio.style.display = 'block';
        }
    } else {
        if (mensajeEnvio) {
            mensajeEnvio.innerHTML = `🎉 ¡ENVÍO GRATIS! Tu pedido califica para envío sin costo 🚚✨`;
            mensajeEnvio.style.background = '#e8f5e9';
            mensajeEnvio.style.color = '#2e7d32';
        }
    }
}

// ============================================
// CARGAR CARRITO
// ============================================
function cargarCarrito() {
    const carritoGuardado = localStorage.getItem('carrito');
    console.log('📦 Carrito guardado:', carritoGuardado);
    
    if (carritoGuardado) {
        carrito = JSON.parse(carritoGuardado);
        total = carrito.reduce((sum, item) => sum + (item.precio * (item.cantidad || 1)), 0);
        console.log('💰 Total calculado:', total);
    } else {
        carrito = [];
        total = 0;
        console.log('⚠️ No hay carrito guardado');
    }
}

// ============================================
// AVANZAR AL SIGUIENTE PASO
// ============================================
function avanzarPaso() {
    if (pasoActual === 1) {
        const nombre = document.getElementById('nombre')?.value.trim();
        const direccion = document.getElementById('direccion')?.value.trim();
        const correo = document.getElementById('correo')?.value.trim();
        
        if (!nombre || !direccion || !correo) {
            mostrarToast('Completa todos los campos de envío', 'error');
            return;
        }
        if (!correo.includes('@')) {
            mostrarToast('Ingresa un correo válido', 'error');
            return;
        }
        
        localStorage.setItem('envio_nombre', nombre);
        localStorage.setItem('envio_direccion', direccion);
        localStorage.setItem('envio_correo', correo);
        
        pasoActual = 2;
        
        const shippingSection = document.getElementById('shipping-section');
        const paymentSection = document.getElementById('payment-section');
        const btnContinuar = document.getElementById('btnContinuar');
        const btnPagar = document.getElementById('btnPagar');
        
        if (shippingSection) shippingSection.style.display = 'none';
        if (paymentSection) paymentSection.style.display = 'block';
        if (btnContinuar) btnContinuar.style.display = 'none';
        if (btnPagar) btnPagar.style.display = 'block';
        
        actualizarBarraProgreso();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (pasoActual === 2) {
        const metodoSeleccionado = document.querySelector('input[name="metodoPago"]:checked');
        
        if (!metodoSeleccionado) {
            mostrarToast('Selecciona un método de pago', 'error');
            return;
        }
        
        const metodoPago = metodoSeleccionado.value;
        
        if (metodoPago === 'tarjeta') {
            const numeroTarjeta = document.getElementById('numeroTarjeta')?.value.replace(/\s/g, '');
            const expira = document.getElementById('expira')?.value;
            const cvv = document.getElementById('cvvTarjeta')?.value;
            
            if (!numeroTarjeta || numeroTarjeta.length < 16) {
                mostrarToast('Número de tarjeta inválido', 'error');
                return;
            }
            if (!expira || expira.length < 5) {
                mostrarToast('Fecha de expiración inválida', 'error');
                return;
            }
            if (!cvv || cvv.length < 3) {
                mostrarToast('CVV inválido', 'error');
                return;
            }
        }
        
        pasoActual = 3;
        actualizarBarraProgreso();
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
// PROCESAR PAGO
// ============================================
async function procesarPago() {
    const metodoSeleccionado = document.querySelector('input[name="metodoPago"]:checked');
    
    if (!metodoSeleccionado) {
        mostrarToast('Selecciona un método de pago', 'error');
        return;
    }
    
    const metodoPago = metodoSeleccionado.value;
    const btnPagar = document.getElementById('btnConfirmar') || document.getElementById('btnPagar');
    if (!btnPagar) return;
    
    const textoOriginal = btnPagar.textContent;
    btnPagar.textContent = '⏳ Procesando...';
    btnPagar.disabled = true;
    
    try {
        if (metodoPago === 'mercadopago') {
            await procesarMercadoPago(btnPagar, textoOriginal);
       } else if (metodoPago === 'tarjeta') {
    // Guardar pedido y redirigir a success.html
    const pedidoGuardado = await guardarPedidoEnBackend('tarjeta');
    if (pedidoGuardado) {
        mostrarToast('Pago procesado exitosamente', 'success');
        setTimeout(() => {
            window.location.href = 'success.html';
        }, 1500);
    }
}
    } catch (error) {
        console.error('Error:', error);
        mostrarToast('Error de conexión. Intenta de nuevo.', 'error');
        btnPagar.textContent = textoOriginal;
        btnPagar.disabled = false;
    }
}

// ============================================
// PROCESAR CON MERCADO PAGO (con envío incluido)
// ============================================
async function procesarMercadoPago(btnPagar, textoOriginal) {
    if (!carrito || carrito.length === 0) {
        mostrarToast('El carrito está vacío', 'error');
        btnPagar.textContent = textoOriginal;
        btnPagar.disabled = false;
        return;
    }
    
    const items = carrito.map(item => ({
        nombre: item.nombre,
        precio: item.precio,
        cantidad: item.cantidad || 1
    }));
    
    const nombre = localStorage.getItem('envio_nombre') || '';
    const direccion = localStorage.getItem('envio_direccion') || '';
    const correo = localStorage.getItem('envio_correo') || '';
    const envioCosto = calcularEnvio();
    
    console.log('📦 Enviando a Mercado Pago:', { items, envio: envioCosto, total: total + envioCosto });
    
    try {
        // 1. Primero guardar el pedido en el backend
        const pedidoGuardado = await guardarPedidoEnBackend('mercadopago');
        
        if (!pedidoGuardado) {
            mostrarToast('Error al guardar el pedido', 'error');
            btnPagar.textContent = textoOriginal;
            btnPagar.disabled = false;
            return;
        }
        
        // 2. Crear preferencia en Mercado Pago con el envío incluido
        const response = await fetch('https://luxe-api-frr5.onrender.com/api/crear-preferencia', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                items: items,
                envio: envioCosto,  // 👈 Enviar el costo de envío
                payer: { 
                    name: nombre, 
                    email: correo, 
                    address: direccion 
                }
            })
        });
        
        const data = await response.json();
        
        if (data.init_point) {
            // Guardar referencia del pedido para después del pago
            localStorage.setItem('pedidoPendiente', JSON.stringify({
                id: pedidoGuardado.id,
                total: total + envioCosto
            }));
            
            // Redirigir a Mercado Pago
            window.location.href = data.init_point;
        } else {
            mostrarToast(data.error || 'Error al crear el pago', 'error');
            btnPagar.textContent = textoOriginal;
            btnPagar.disabled = false;
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarToast('Error de conexión', 'error');
        btnPagar.textContent = textoOriginal;
        btnPagar.disabled = false;
    }
}

// ============================================
// GUARDAR PEDIDO EN EL BACKEND
// ============================================
async function guardarPedidoEnBackend(metodoPago) {
    const nombre = localStorage.getItem('envio_nombre') || '';
    const direccion = localStorage.getItem('envio_direccion') || '';
    const correo = localStorage.getItem('envio_correo') || '';
    const envioCosto = calcularEnvio();
    const totalPagar = total + envioCosto;
    
    const pedidoData = {
        items: carrito.map(item => ({
            productoId: item.id,
            nombre: item.nombre,
            precio: item.precio,
            cantidad: item.cantidad || 1,
            imagen: item.img
        })),
        subtotal: total,
        envio: envioCosto,
        total: totalPagar,
        direccion: direccion,
        correo: correo,
        nombre: nombre,
        metodoPago: metodoPago
    };
    
    console.log('📝 Guardando pedido en backend:', pedidoData);
    
    try {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        // Si hay token, agregarlo para identificar al usuario
        if (userToken) {
            headers['Authorization'] = `Bearer ${userToken}`;
        }
        
        const response = await fetch('https://luxe-api-frr5.onrender.com/api/orders', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(pedidoData)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error al guardar pedido');
        }
        
        const result = await response.json();
        console.log('✅ Pedido guardado en backend:', result);
        
        // También guardar en localStorage para respaldo
        const pedidoLocal = {
            id: result.pedido?.id || Date.now(),
            fecha: new Date().toISOString(),
            items: carrito,
            subtotal: total,
            envio: envioCosto,
            total: totalPagar,
            envioData: { nombre, direccion, correo },
            metodoPago: metodoPago,
            estado: 'pendiente'
        };
        
        let pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
        pedidos.push(pedidoLocal);
        localStorage.setItem('pedidos', JSON.stringify(pedidos));
        localStorage.setItem('ultimoPedido', JSON.stringify(pedidoLocal));
        localStorage.removeItem('carrito');
        
        return result.pedido || pedidoLocal;
        
    } catch (error) {
        console.error('❌ Error guardando pedido:', error);
        mostrarToast('Error al guardar el pedido', 'error');
        throw error;
    }
}

// ============================================
// MOSTRAR CONFIRMACIÓN
// ============================================
function mostrarConfirmacion() {
    const checkoutCard = document.querySelector('.checkout-card');
    const nombre = localStorage.getItem('envio_nombre') || '';
    const direccion = localStorage.getItem('envio_direccion') || '';
    const metodoPagoRadio = document.querySelector('input[name="metodoPago"]:checked');
    const metodoPago = metodoPagoRadio ? metodoPagoRadio.value : 'tarjeta';
    
    let metodoTexto = '';
    if (metodoPago === 'tarjeta') metodoTexto = '💳 Tarjeta de Crédito/Débito';
    else if (metodoPago === 'mercadopago') metodoTexto = '💰 Mercado Pago';
    
    const envioCosto = calcularEnvio();
    const totalPagar = total + envioCosto;
    
    checkoutCard.innerHTML = `
        <h2 class="checkout-title">Confirmar Pedido</h2>
        
        <div class="checkout-progress">
            <div class="progress-step active"><span class="step-number">1</span><span class="step-label">Envío</span></div>
            <div class="progress-line" style="background: #ff4d6d;"></div>
            <div class="progress-step active"><span class="step-number">2</span><span class="step-label">Pago</span></div>
            <div class="progress-line" style="background: #ff4d6d;"></div>
            <div class="progress-step active"><span class="step-number">3</span><span class="step-label">Confirmar</span></div>
        </div>
        
        <div style="text-align: left; margin: 20px 0;">
            <h3 style="color: #ff4d6d;">📦 Datos de Envío</h3>
            <p><strong>Nombre:</strong> ${escapeHTML(nombre)}</p>
            <p><strong>Dirección:</strong> ${escapeHTML(direccion)}</p>
            
            <h3 style="color: #ff4d6d; margin-top: 20px;">💳 Método de Pago</h3>
            <p>${metodoTexto}</p>
        </div>
        
        <div class="checkout-summary">
            <h3>🛍️ Resumen de compra</h3>
            <div class="summary-row"><span>Subtotal (${carrito.length} productos):</span><span>$${total.toFixed(2)}</span></div>
            <div class="summary-row"><span>Envío:</span><span>${envioCosto === 0 ? 'GRATIS 🎉' : `$${envioCosto.toFixed(2)}`}</span></div>
            <div class="summary-divider"></div>
            <div class="summary-row total-row"><span>Total a Pagar:</span><span>$${totalPagar.toFixed(2)}</span></div>
        </div>
        
        <div class="checkout-actions">
            <button id="btnConfirmar" class="btn-luxe-pay">✅ Confirmar y Pagar</button>
        </div>
        
        <p class="secure-text">🔒 Tus datos están seguros. El pago se procesa de forma encriptada.</p>
    `;
    
    const btnConfirmar = document.getElementById('btnConfirmar');
    if (btnConfirmar) btnConfirmar.addEventListener('click', procesarPago);
}

// ============================================
// ESCAPE HTML
// ============================================
function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// ============================================
// MOSTRAR TOAST
// ============================================
function mostrarToast(mensaje, tipo = 'success') {
    let toast = document.getElementById('custom-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'custom-toast';
        toast.style.cssText = `
            position: fixed;
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%);
            background: ${tipo === 'error' ? '#ff4d6d' : '#4caf50'};
            color: white;
            padding: 12px 24px;
            border-radius: 25px;
            font-size: 14px;
            z-index: 9999;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            white-space: nowrap;
        `;
        document.body.appendChild(toast);
    }
    
    toast.textContent = mensaje;
    toast.style.background = tipo === 'error' ? '#ff4d6d' : '#4caf50';
    toast.style.display = 'block';
    
    setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
}

// ============================================
// NEWSLETTER
// ============================================
function suscribirse() {
    const email = document.getElementById('newsletter-email')?.value;
    if (email && email.includes('@')) {
        mostrarToast('¡Bienvenida al Club Luxe!', 'success');
        document.getElementById('newsletter-email').value = '';
    } else {
        mostrarToast('Email inválido', 'error');
    }
}