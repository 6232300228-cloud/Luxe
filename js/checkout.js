// ============================================
// VARIABLES GLOBALES
// ============================================
let carrito = [];
let total = 0;
let pasoActual = 1;
let userToken = null;

const ENVIO_GRATIS_MINIMO = 500;
const COSTO_ENVIO = 1;

// ============================================
// INICIALIZACION
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('Checkout inicializado');
    
    userToken = localStorage.getItem('token');
    
    cargarCarrito();
    actualizarResumen();
    
    const btnContinuar = document.getElementById('btnContinuar');
    const btnPagar = document.getElementById('btnPagar');
    
    if (btnContinuar) btnContinuar.addEventListener('click', avanzarPaso);
    if (btnPagar) btnPagar.addEventListener('click', procesarPago);
    
    const radios = document.querySelectorAll('input[name="metodoPago"]');
    for (let i = 0; i < radios.length; i++) {
        radios[i].addEventListener('change', function() {
            const tarjetaBox = document.getElementById('tarjetaBox');
            const mercadopagoBox = document.getElementById('mercadopagoBox');
            if (tarjetaBox) tarjetaBox.classList.add('hidden');
            if (mercadopagoBox) mercadopagoBox.classList.add('hidden');
            
            if (this.value === 'tarjeta') {
                if (tarjetaBox) tarjetaBox.classList.remove('hidden');
            } else if (this.value === 'mercadopago') {
                if (mercadopagoBox) mercadopagoBox.classList.remove('hidden');
            }
        });
    }
    
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        const nombreInput = document.getElementById('nombre');
        const correoInput = document.getElementById('correo');
        if (nombreInput && user.nombre) nombreInput.value = user.nombre;
        if (correoInput && user.correo) correoInput.value = user.correo;
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
    
    if (subtotalEl) subtotalEl.textContent = '$' + Math.round(subtotal);
    
    if (envioEl) {
        if (envio === 0) {
            envioEl.textContent = 'GRATIS';
            envioEl.style.color = '#4caf50';
        } else {
            envioEl.textContent = '$' + envio;
            envioEl.style.color = '#666';
        }
    }
    
    if (totalEl) totalEl.textContent = '$' + Math.round(totalPagar);
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
                mensajeEnvio.style.cssText = 'background: #fff0f3; padding: 10px; border-radius: 10px; margin-bottom: 15px; font-size: 13px; text-align: center; color: #ff4d6d;';
                summary.insertBefore(mensajeEnvio, summary.firstChild);
            }
        }
        if (mensajeEnvio) {
            mensajeEnvio.innerHTML = 'Agrega $' + Math.round(faltante) + ' mas para obtener ENVIO GRATIS';
            mensajeEnvio.style.display = 'block';
        }
    } else {
        if (mensajeEnvio) {
            mensajeEnvio.innerHTML = 'ENVIO GRATIS. Tu pedido califica para envio sin costo';
            mensajeEnvio.style.background = '#e8f5e9';
            mensajeEnvio.style.color = '#2e7d32';
        }
    }
}

function cargarCarrito() {
    const carritoGuardado = localStorage.getItem('carrito');
    if (carritoGuardado) {
        carrito = JSON.parse(carritoGuardado);
        total = 0;
        for (let i = 0; i < carrito.length; i++) {
            total = total + (carrito[i].precio * (carrito[i].cantidad || 1));
        }
    } else {
        carrito = [];
        total = 0;
    }
}

function avanzarPaso() {
    if (pasoActual === 1) {
        const nombreInput = document.getElementById('nombre');
        const direccionInput = document.getElementById('direccion');
        const correoInput = document.getElementById('correo');
        
        const nombre = nombreInput ? nombreInput.value.trim() : '';
        const direccion = direccionInput ? direccionInput.value.trim() : '';
        const correo = correoInput ? correoInput.value.trim() : '';
        
        if (!nombre || !direccion || !correo) {
            mostrarToast('Completa todos los campos de envio', 'error');
            return;
        }
        if (!correo.includes('@')) {
            mostrarToast('Ingresa un correo valido', 'error');
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
            mostrarToast('Selecciona un metodo de pago', 'error');
            return;
        }
        
        const metodoPago = metodoSeleccionado.value;
        
        if (metodoPago === 'tarjeta') {
            const numeroTarjetaInput = document.getElementById('numeroTarjeta');
            const expiraInput = document.getElementById('expira');
            const cvvInput = document.getElementById('cvvTarjeta');
            
            const numeroTarjeta = numeroTarjetaInput ? numeroTarjetaInput.value.replace(/\s/g, '') : '';
            const expira = expiraInput ? expiraInput.value : '';
            const cvv = cvvInput ? cvvInput.value : '';
            
            if (!numeroTarjeta || numeroTarjeta.length < 16) {
                mostrarToast('Numero de tarjeta invalido', 'error');
                return;
            }
            if (!expira || expira.length < 5) {
                mostrarToast('Fecha de expiracion invalida', 'error');
                return;
            }
            if (!cvv || cvv.length < 3) {
                mostrarToast('CVV invalido', 'error');
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
    
    for (let i = 0; i < steps.length; i++) {
        if (i + 1 <= pasoActual) {
            steps[i].classList.add('active');
        } else {
            steps[i].classList.remove('active');
        }
    }
    
    for (let i = 0; i < lines.length; i++) {
        if (i + 1 < pasoActual) {
            lines[i].style.background = '#ff4d6d';
        } else {
            lines[i].style.background = '#f0f0f0';
        }
    }
}

async function guardarPedidoCompleto(metodoPago) {
    const nombre = localStorage.getItem('envio_nombre') || '';
    const direccion = localStorage.getItem('envio_direccion') || '';
    const correo = localStorage.getItem('envio_correo') || '';
    const envioCosto = calcularEnvio();
    const totalPagar = total + envioCosto;
    
    const itemsCarrito = [];
    for (let i = 0; i < carrito.length; i++) {
        itemsCarrito.push({
            id: carrito[i].id,
            nombre: carrito[i].nombre,
            precio: Math.round(carrito[i].precio),
            cantidad: carrito[i].cantidad || 1,
            img: carrito[i].img || ''
        });
    }
    
    const pedidoLocal = {
        idLocal: Date.now(),
        fecha: new Date().toISOString(),
        items: itemsCarrito,
        subtotal: Math.round(total),
        envio: envioCosto,
        total: Math.round(totalPagar),
        envioData: { nombre: nombre, direccion: direccion, correo: correo },
        metodoPago: metodoPago,
        estado: 'pendiente',
        idBackend: null
    };
    
    const token = localStorage.getItem('token');
    let pedidoBackendId = null;
    
    if (token) {
        try {
            const productosData = [];
            for (let i = 0; i < carrito.length; i++) {
                productosData.push({
                    nombre: carrito[i].nombre,
                    precio: Math.round(carrito[i].precio),
                    cantidad: carrito[i].cantidad || 1,
                    imagen: carrito[i].img || ''
                });
            }
            
            const pedidoData = {
                usuario: {
                    nombre: nombre,
                    correo: correo,
                    direccion: direccion,
                    telefono: ''
                },
                productos: productosData,
                total: Math.round(totalPagar),
                metodoPago: metodoPago === 'mercadopago' ? 'mercadopago' : 'tarjeta'
            };
            
            console.log('Enviando pedido al backend:', pedidoData);
            
            const response = await fetch('https://luxe-api-frr5.onrender.com/api/orders/crear', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify(pedidoData)
            });
            
            if (response.ok) {
                const result = await response.json();
                console.log('Respuesta del backend:', result);
                pedidoBackendId = result.pedido?.id || result.id;
                pedidoLocal.idBackend = pedidoBackendId;
                pedidoLocal.estado = 'pagado';
                console.log('Pedido guardado en backend con ID:', pedidoBackendId);
            } else {
                const errorText = await response.text();
                console.error('Error del backend:', errorText);
            }
        } catch (error) {
            console.error('Error guardando en backend:', error);
        }
    }
    
    let pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
    
    if (pedidoBackendId) {
        pedidoLocal.id = pedidoBackendId;
    } else {
        pedidoLocal.id = pedidoLocal.idLocal;
    }
    
    pedidos.push(pedidoLocal);
    localStorage.setItem('pedidos', JSON.stringify(pedidos));
    localStorage.setItem('ultimoPedido', JSON.stringify(pedidoLocal));
    localStorage.removeItem('carrito');
    
    return pedidoLocal;
}

async function procesarTarjeta(btnPagar, textoOriginal) {
    try {
        await guardarPedidoCompleto('tarjeta');
        
        const nombre = localStorage.getItem('envio_nombre') || '';
        const correo = localStorage.getItem('envio_correo') || '';
        const envioCosto = calcularEnvio();
        
        const productosData = [];
        for (let i = 0; i < carrito.length; i++) {
            productosData.push({
                nombre: carrito[i].nombre,
                cantidad: carrito[i].cantidad || 1,
                precio: carrito[i].precio
            });
        }
        
        const datosCompra = {
            email: correo,
            nombre: nombre,
            productos: productosData,
            total: total + envioCosto,
            fecha: new Date().toISOString()
        };
        
        fetch('https://luxe-api-frr5.onrender.com/api/confirmar-compra', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                emailCliente: correo,
                datosCompra: datosCompra
            })
        }).catch(function(error) { console.error('Error enviando correo:', error); });
        
        mostrarToast('Pago procesado exitosamente', 'success');
        setTimeout(function() {
            window.location.href = 'success.html';
        }, 1500);
    } catch (error) {
        console.error('Error:', error);
        mostrarToast('Error al procesar el pago', 'error');
        btnPagar.textContent = textoOriginal;
        btnPagar.disabled = false;
    }
}

async function procesarMercadoPago(btnPagar, textoOriginal) {
    if (!carrito || carrito.length === 0) {
        mostrarToast('El carrito esta vacio', 'error');
        btnPagar.textContent = textoOriginal;
        btnPagar.disabled = false;
        return;
    }
    
    const nombre = localStorage.getItem('envio_nombre') || '';
    const direccion = localStorage.getItem('envio_direccion') || '';
    const correo = localStorage.getItem('envio_correo') || '';
    const envioCosto = calcularEnvio();
    const totalPagar = total + envioCosto;
    
    // 1. Guardar el pedido en el backend ANTES de ir a Mercado Pago
    const token = localStorage.getItem('token');
    let pedidoBackendId = null;
    
    if (token) {
        try {
            const productosData = [];
            for (let i = 0; i < carrito.length; i++) {
                productosData.push({
                    nombre: carrito[i].nombre,
                    precio: Math.round(carrito[i].precio),
                    cantidad: carrito[i].cantidad || 1,
                    imagen: carrito[i].img || ''
                });
            }
            
            const pedidoData = {
                usuario: {
                    nombre: nombre,
                    correo: correo,
                    direccion: direccion,
                    telefono: ''
                },
                productos: productosData,
                total: Math.round(totalPagar),
                metodoPago: 'mercadopago',
                estado: 'pendiente'
            };
            
            console.log('Guardando pedido en backend antes de MP:', pedidoData);
            
            const response = await fetch('https://luxe-api-frr5.onrender.com/api/orders/crear', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify(pedidoData)
            });
            
            if (response.ok) {
                const result = await response.json();
                pedidoBackendId = result.pedido?.id || result.id;
                console.log('Pedido guardado en backend con ID:', pedidoBackendId);
            } else {
                console.error('Error guardando pedido en backend:', await response.text());
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }
    
    // 2. Guardar en localStorage como respaldo
    const itemsCarrito = [];
    for (let i = 0; i < carrito.length; i++) {
        itemsCarrito.push({
            nombre: carrito[i].nombre,
            precio: Math.round(carrito[i].precio),
            cantidad: carrito[i].cantidad || 1,
            img: carrito[i].img || ''
        });
    }
    
    const pedidoCompleto = {
        id: pedidoBackendId || Date.now(),
        idBackend: pedidoBackendId,
        fecha: new Date().toISOString(),
        items: itemsCarrito,
        subtotal: Math.round(total),
        envio: envioCosto,
        total: Math.round(totalPagar),
        envioData: { nombre: nombre, direccion: direccion, correo: correo },
        metodoPago: 'mercadopago',
        estado: 'pendiente'
    };
    
    // Guardar en localStorage
    let pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
    pedidos.push(pedidoCompleto);
    localStorage.setItem('pedidos', JSON.stringify(pedidos));
    localStorage.setItem('ultimoPedido', JSON.stringify(pedidoCompleto));
    
    // 3. Guardar datos para el correo
    const productosData = [];
    for (let i = 0; i < carrito.length; i++) {
        productosData.push({
            nombre: carrito[i].nombre,
            cantidad: carrito[i].cantidad || 1,
            precio: carrito[i].precio
        });
    }
    
    const datosCompra = {
        email: correo,
        nombre: nombre,
        direccion: direccion,
        productos: productosData,
        total: totalPagar,
        metodoPago: 'mercadopago',
        fecha: new Date().toISOString(),
        pedidoId: pedidoBackendId
    };
    localStorage.setItem('compraPendiente', JSON.stringify(datosCompra));
    
    // 4. Crear preferencia en Mercado Pago
    const items = [];
    for (let i = 0; i < carrito.length; i++) {
        items.push({
            nombre: carrito[i].nombre,
            precio: carrito[i].precio,
            cantidad: carrito[i].cantidad || 1
        });
    }
    
    const response = await fetch('https://luxe-api-frr5.onrender.com/api/crear-preferencia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            items: items,
            envio: envioCosto,
            payer: { name: nombre, email: correo, address: direccion },
            external_reference: pedidoBackendId ? pedidoBackendId.toString() : Date.now().toString()
        })
    });
    
    const data = await response.json();
    
    if (data.init_point) {
        // Limpiar carrito solo despues de crear la preferencia
        localStorage.removeItem('carrito');
        window.location.href = data.init_point;
    } else {
        mostrarToast(data.error || 'Error al crear el pago', 'error');
        btnPagar.textContent = textoOriginal;
        btnPagar.disabled = false;
    }
}

async function procesarPago() {
    const metodoSeleccionado = document.querySelector('input[name="metodoPago"]:checked');
    if (!metodoSeleccionado) {
        mostrarToast('Selecciona un metodo de pago', 'error');
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
        mostrarToast('Error de conexion. Intenta de nuevo.', 'error');
        btnPagar.textContent = textoOriginal;
        btnPagar.disabled = false;
    }
}

function mostrarConfirmacion() {
    const checkoutCard = document.querySelector('.checkout-card');
    const nombre = localStorage.getItem('envio_nombre') || '';
    const direccion = localStorage.getItem('envio_direccion') || '';
    const metodoPagoRadio = document.querySelector('input[name="metodoPago"]:checked');
    const metodoPago = metodoPagoRadio ? metodoPagoRadio.value : 'tarjeta';
    
    let metodoTexto = metodoPago === 'tarjeta' ? 'Tarjeta de Credito o Debito' : 'Mercado Pago';
    const envioCosto = calcularEnvio();
    const totalPagar = total + envioCosto;
    
    checkoutCard.innerHTML = `
        <h2 class="checkout-title">Confirmar Pedido</h2>
        <div class="checkout-progress">
            <div class="progress-step active"><span class="step-number">1</span><span class="step-label">Envio</span></div>
            <div class="progress-line" style="background: #ff4d6d;"></div>
            <div class="progress-step active"><span class="step-number">2</span><span class="step-label">Pago</span></div>
            <div class="progress-line" style="background: #ff4d6d;"></div>
            <div class="progress-step active"><span class="step-number">3</span><span class="step-label">Confirmar</span></div>
        </div>
        <div style="text-align: left; margin: 20px 0;">
            <h3 style="color: #ff4d6d;">Datos de Envio</h3>
            <p><strong>Nombre:</strong> ${escapeHTML(nombre)}</p>
            <p><strong>Direccion:</strong> ${escapeHTML(direccion)}</p>
            <h3 style="color: #ff4d6d; margin-top: 20px;">Metodo de Pago</h3>
            <p>${metodoTexto}</p>
        </div>
        <div class="checkout-summary">
            <h3>Resumen de compra</h3>
            <div class="summary-row"><span>Subtotal (${carrito.length} productos):</span><span>$${Math.round(total)}</span></div>
            <div class="summary-row"><span>Envio:</span><span>${envioCosto === 0 ? 'GRATIS' : '$' + envioCosto}</span></div>
            <div class="summary-divider"></div>
            <div class="summary-row total-row"><span>Total a Pagar:</span><span>$${Math.round(totalPagar)}</span></div>
        </div>
        <div class="checkout-actions">
            <button id="btnConfirmar" class="btn-luxe-pay">Confirmar y Pagar</button>
        </div>
        <p class="secure-text">Pago procesado de forma segura y encriptada</p>
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

function mostrarToast(mensaje, tipo) {
    if (tipo === undefined) tipo = 'success';
    let toast = document.getElementById('toast');
    if (toast) {
        toast.textContent = mensaje;
        toast.style.background = tipo === 'error' ? '#ff4d6d' : '#4caf50';
        toast.classList.add('show');
        setTimeout(function() { toast.classList.remove('show'); }, 3000);
    } else {
        alert(mensaje);
    }
}