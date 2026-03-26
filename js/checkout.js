// ============================================
// CHECKOUT.JS - GUARDAR EN LOCALSTORAGE Y BACKEND
// ============================================

// Variables globales
let carrito = [];
let total = 0;
let pasoActual = 1;
let userToken = null;

// Constantes de envío
const ENVIO_GRATIS_MINIMO = 500;
const COSTO_ENVIO = 50;

// ============================================
// INICIALIZACIÓN
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Checkout inicializado');
    
    userToken = localStorage.getItem('token');
    
    cargarCarrito();
    actualizarResumen();
    
    const btnContinuar = document.getElementById('btnContinuar');
    const btnPagar = document.getElementById('btnPagar');
    
    if (btnContinuar) btnContinuar.addEventListener('click', avanzarPaso);
    if (btnPagar) btnPagar.addEventListener('click', procesarPago);
    
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
    
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        const nombreInput = document.getElementById('nombre');
        const correoInput = document.getElementById('correo');
        if (nombreInput && user.nombre) nombreInput.value = user.nombre;
        if (correoInput && user.correo) correoInput.value = user.correo;
    }
    
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        const carritoGuardado = JSON.parse(localStorage.getItem('carrito')) || [];
        const totalItems = carritoGuardado.reduce((sum, item) => sum + (item.cantidad || 1), 0);
        cartCount.textContent = totalItems;
    }
});

function calcularEnvio() {
    return (total >= ENVIO_GRATIS_MINIMO) ? 0 : COSTO_ENVIO;
}

function actualizarResumen() {
    const subtotal = total;
    const envio = calcularEnvio();
    const totalPagar = subtotal + envio;
    
    const subtotalEl = document.getElementById('resumen-subtotal');
    const envioEl = document.getElementById('resumen-envio');
    const totalEl = document.getElementById('resumen-total');
    
    if (subtotalEl) subtotalEl.textContent = `$${Math.round(subtotal)}`;
    
    if (envioEl) {
        if (envio === 0) {
            envioEl.textContent = 'GRATIS';
            envioEl.style.color = '#4caf50';
        } else {
            envioEl.textContent = `$${envio}`;
            envioEl.style.color = '#666';
        }
    }
    
    if (totalEl) totalEl.textContent = `$${Math.round(totalPagar)}`;
    mostrarMensajeEnvio();
}

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
            mensajeEnvio.innerHTML = `💰 Agrega $${Math.round(faltante)} más para obtener ENVIO GRATIS`;
            mensajeEnvio.style.display = 'block';
        }
    } else {
        if (mensajeEnvio) {
            mensajeEnvio.innerHTML = `🎉 ENVIO GRATIS! Tu pedido califica para envío sin costo`;
            mensajeEnvio.style.background = '#e8f5e9';
            mensajeEnvio.style.color = '#2e7d32';
        }
    }
}

function cargarCarrito() {
    const carritoGuardado = localStorage.getItem('carrito');
    if (carritoGuardado) {
        carrito = JSON.parse(carritoGuardado);
        total = carrito.reduce((sum, item) => sum + (item.precio * (item.cantidad || 1)), 0);
    } else {
        carrito = [];
        total = 0;
    }
}

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
        
        document.getElementById('shipping-section').style.display = 'none';
        document.getElementById('payment-section').style.display = 'block';
        document.getElementById('btnContinuar').style.display = 'none';
        document.getElementById('btnPagar').style.display = 'block';
        
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
// GUARDAR PEDIDO EN LOCALSTORAGE Y BACKEND
// ============================================
async function guardarPedidoCompleto(metodoPago) {
    const nombre = localStorage.getItem('envio_nombre') || '';
    const direccion = localStorage.getItem('envio_direccion') || '';
    const correo = localStorage.getItem('envio_correo') || '';
    const envioCosto = calcularEnvio();
    const totalPagar = total + envioCosto;
    
    // Datos para el pedido local
    const pedidoLocal = {
        id: Date.now(),
        fecha: new Date().toISOString(),
        items: carrito.map(item => ({
            ...item,
            precio: Math.round(item.precio)
        })),
        subtotal: Math.round(total),
        envio: envioCosto,
        total: Math.round(totalPagar),
        envioData: { nombre, direccion, correo },
        metodoPago: metodoPago,
        estado: 'pendiente'
    };
    
    // 1. Guardar en localStorage
    let pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
    pedidos.push(pedidoLocal);
    localStorage.setItem('pedidos', JSON.stringify(pedidos));
    localStorage.setItem('ultimoPedido', JSON.stringify(pedidoLocal));
    localStorage.removeItem('carrito');
    
    // 2. Guardar en backend (si hay token)
    const token = localStorage.getItem('token');
    if (token) {
        try {
            const pedidoData = {
                usuario: {
                    nombre: nombre,
                    correo: correo,
                    direccion: direccion,
                    telefono: ''
                },
                productos: carrito.map(item => ({
                    nombre: item.nombre,
                    precio: Math.round(item.precio),
                    cantidad: item.cantidad || 1,
                    imagen: item.img || ''
                })),
                total: Math.round(totalPagar),
                metodoPago: metodoPago === 'mercadopago' ? 'tarjeta' : metodoPago
            };
            
            const response = await fetch('https://luxe-api-frr5.onrender.com/api/orders/crear', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(pedidoData)
            });
            
            if (response.ok) {
                const result = await response.json();
                console.log('✅ Pedido guardado en backend:', result);
                // Actualizar el ID del pedido local con el ID de MongoDB
                if (result.pedido?.id) {
                    pedidoLocal.id = result.pedido.id;
                    pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
                    const index = pedidos.findIndex(p => p.id === pedidoLocal.id || p.fecha === pedidoLocal.fecha);
                    if (index !== -1) {
                        pedidos[index] = pedidoLocal;
                        localStorage.setItem('pedidos', JSON.stringify(pedidos));
                        localStorage.setItem('ultimoPedido', JSON.stringify(pedidoLocal));
                    }
                }
            } else {
                console.log('⚠️ No se pudo guardar en backend, pedido solo en localStorage');
            }
        } catch (error) {
            console.error('❌ Error guardando en backend:', error);
            console.log('⚠️ Pedido guardado solo en localStorage');
        }
    } else {
        console.log('⚠️ Usuario no logueado, pedido solo en localStorage');
    }
    
    return pedidoLocal;
}

// ============================================
// PROCESAR PAGO - TARJETA
// ============================================
async function procesarTarjeta(btnPagar, textoOriginal) {
    try {
        await guardarPedidoCompleto('tarjeta');
        mostrarToast('Pago procesado exitosamente', 'success');
        setTimeout(() => {
            window.location.href = 'success.html';
        }, 1500);
    } catch (error) {
        console.error('Error:', error);
        mostrarToast('Error al procesar el pago', 'error');
        btnPagar.textContent = textoOriginal;
        btnPagar.disabled = false;
    }
}

// ============================================
// MERCADO PAGO
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
    
    try {
        // Guardar pedido (localStorage + backend)
        await guardarPedidoCompleto('mercadopago');
        
        const response = await fetch('https://luxe-api-frr5.onrender.com/api/crear-preferencia', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                items: items,
                envio: envioCosto,
                payer: { name: nombre, email: correo, address: direccion }
            })
        });
        
        const data = await response.json();
        
        if (data.init_point) {
            window.location.href = data.init_point;
        } else {
            mostrarToast(data.error || 'Error al crear el pago', 'error');
            btnPagar.textContent = textoOriginal;
            btnPagar.disabled = false;
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarToast('Error de conexión: ' + error.message, 'error');
        btnPagar.textContent = textoOriginal;
        btnPagar.disabled = false;
    }
}

// ============================================
// PROCESAR PAGO PRINCIPAL
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
    btnPagar.textContent = 'Procesando...';
    btnPagar.disabled = true;
    
    try {
        if (metodoPago === 'mercadopago') {
            await procesarMercadoPago(btnPagar, textoOriginal);
        } else if (metodoPago === 'tarjeta') {
            await procesarTarjeta(btnPagar, textoOriginal);
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarToast('Error de conexión. Intenta de nuevo.', 'error');
        btnPagar.textContent = textoOriginal;
        btnPagar.disabled = false;
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
    
    let metodoTexto = metodoPago === 'tarjeta' ? 'Tarjeta de Crédito/Débito' : 'Mercado Pago';
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
            <h3 style="color: #ff4d6d;">Datos de Envío</h3>
            <p><strong>Nombre:</strong> ${escapeHTML(nombre)}</p>
            <p><strong>Dirección:</strong> ${escapeHTML(direccion)}</p>
            <h3 style="color: #ff4d6d; margin-top: 20px;">Método de Pago</h3>
            <p>${metodoTexto}</p>
        </div>
        <div class="checkout-summary">
            <h3>Resumen de compra</h3>
            <div class="summary-row"><span>Subtotal (${carrito.length} productos):</span><span>$${Math.round(total)}</span></div>
            <div class="summary-row"><span>Envío:</span><span>${envioCosto === 0 ? 'GRATIS' : `$${envioCosto}`}</span></div>
            <div class="summary-divider"></div>
            <div class="summary-row total-row"><span>Total a Pagar:</span><span>$${Math.round(totalPagar)}</span></div>
        </div>
        <div class="checkout-actions">
            <button id="btnConfirmar" class="btn-luxe-pay">Confirmar y Pagar</button>
        </div>
        <p class="secure-text">🔒 Tus datos están seguros. El pago se procesa de forma encriptada.</p>
    `;
    
    document.getElementById('btnConfirmar').addEventListener('click', procesarPago);
}

function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

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
    setTimeout(() => { toast.style.display = 'none'; }, 3000);
}

function suscribirse() {
    const email = document.getElementById('newsletter-email')?.value;
    if (email && email.includes('@')) {
        mostrarToast('Bienvenida al Club Luxe', 'success');
        document.getElementById('newsletter-email').value = '';
    } else {
        mostrarToast('Email inválido', 'error');
    }
}