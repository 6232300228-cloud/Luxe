// checkout.js - Versión mejorada y responsive

document.addEventListener("DOMContentLoaded", () => {
    // Elementos del DOM (actualizados para el nuevo HTML)
    const metodoPagoRadios = document.querySelectorAll('input[name="metodoPago"]');
    const tarjetaBox = document.getElementById("tarjetaBox");
    const paypalBox = document.getElementById("paypalBox");
    const btnContinuar = document.getElementById("btnContinuar");
    const btnPagar = document.getElementById("btnPagar");
    
    // Elementos de los pasos
    const shippingSection = document.getElementById("shipping-section");
    const paymentSection = document.getElementById("payment-section");

    // Mostrar Totales del localStorage
    const pagoInfo = JSON.parse(localStorage.getItem("totalAPagar"));
    if (pagoInfo) {
        document.getElementById("resumen-subtotal").innerText = `$${pagoInfo.subtotal.toFixed(2)}`;
        document.getElementById("resumen-envio").innerText = pagoInfo.envio === 0 ? "GRATIS" : `$${pagoInfo.envio.toFixed(2)}`;
        document.getElementById("resumen-total").innerText = `$${pagoInfo.total.toFixed(2)}`;
    } else {
        // Si no hay pagoInfo, calcular del carrito
        const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
        const subtotal = carrito.reduce((sum, item) => sum + (item.precio * (item.cantidad || 1)), 0);
        const envio = subtotal >= 500 ? 0 : 99;
        const total = subtotal + envio;
        
        document.getElementById("resumen-subtotal").innerText = `$${subtotal.toFixed(2)}`;
        document.getElementById("resumen-envio").innerText = envio === 0 ? "GRATIS" : `$${envio.toFixed(2)}`;
        document.getElementById("resumen-total").innerText = `$${total.toFixed(2)}`;
    }

    // Visibilidad de métodos de pago (para los radios)
    metodoPagoRadios.forEach(radio => {
        radio.addEventListener("change", () => {
            if (radio.value === "tarjeta" && radio.checked) {
                tarjetaBox.classList.remove("hidden");
                paypalBox.classList.add("hidden");
            } else if (radio.value === "paypal" && radio.checked) {
                tarjetaBox.classList.add("hidden");
                paypalBox.classList.remove("hidden");
            }
        });
    });

    // Cargar datos del usuario
    let user = JSON.parse(localStorage.getItem("user"));
    let token = localStorage.getItem("token");

    if (user) {
        if(document.getElementById("correo")) document.getElementById("correo").value = user.correo || "";
        if(document.getElementById("nombre")) document.getElementById("nombre").value = user.nombre || "";
        if(document.getElementById("direccion")) document.getElementById("direccion").value = user.direccion || "";
        if(document.getElementById("correoPaypal")) document.getElementById("correoPaypal").value = user.correo || "";
    }

    // ============================================
    // BOTÓN CONTINUAR (Paso 1 -> Paso 2)
    // ============================================
    if (btnContinuar) {
        btnContinuar.addEventListener("click", () => {
            // Validar información de envío
            const nombre = document.getElementById("nombre").value;
            const direccion = document.getElementById("direccion").value;
            const correo = document.getElementById("correo").value;
            
            if (!nombre || !direccion || !correo) {
                mostrarToast("⚠️ Completa todos los datos de envío");
                return;
            }
            
            if (!correo.includes("@")) {
                mostrarToast("⚠️ Ingresa un correo válido");
                return;
            }
            
            // Ocultar sección de envío y mostrar pago
            if (shippingSection) shippingSection.style.display = "none";
            if (paymentSection) paymentSection.style.display = "block";
            
            // Cambiar botones
            btnContinuar.style.display = "none";
            btnPagar.style.display = "block";
            
            // Actualizar barra de progreso
            actualizarProgreso(2);
            
            // Hacer scroll hacia arriba suavemente
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ============================================
    // PROCESAR PAGO (Paso 2)
    // ============================================
    if (btnPagar) {
        btnPagar.addEventListener("click", async () => {
            // Verificar usuario
            if (!user || !token) { 
                mostrarToast("⚠️ Inicia sesión primero");
                setTimeout(() => { window.location.href = "login.html"; }, 1500);
                return; 
            }

            // Validar datos del formulario
            const nombre = document.getElementById("nombre").value;
            const direccion = document.getElementById("direccion").value;
            const correo = document.getElementById("correo").value;
            
            // Obtener método de pago seleccionado
            const metodoSeleccionado = document.querySelector('input[name="metodoPago"]:checked');
            if (!metodoSeleccionado) {
                mostrarToast("⚠️ Selecciona un método de pago");
                return;
            }
            const metodo = metodoSeleccionado.value;

            if (!nombre || !direccion || !correo) { 
                mostrarToast("⚠️ Completa todos los datos"); 
                return; 
            }

            // Validar según método de pago
            if (metodo === "tarjeta") {
                const numeroTarjeta = document.getElementById("numeroTarjeta").value;
                const expira = document.getElementById("expira").value;
                const cvv = document.getElementById("cvvTarjeta").value;
                
                if (!numeroTarjeta || !expira || !cvv) {
                    mostrarToast("⚠️ Completa los datos de la tarjeta");
                    return;
                }
                
                // Validación básica de tarjeta
                if (numeroTarjeta.replace(/\s/g, '').length < 16) {
                    mostrarToast("⚠️ Número de tarjeta inválido");
                    return;
                }
            } else if (metodo === "paypal") {
                const paypalCorreo = document.getElementById("correoPaypal").value;
                if (!paypalCorreo || !paypalCorreo.includes("@")) {
                    mostrarToast("⚠️ Ingresa un correo válido de PayPal");
                    return;
                }
            }

            // Obtener carrito de localStorage
            const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
            
            if (carrito.length === 0) { 
                mostrarToast("❌ Error: El carrito está vacío"); 
                return; 
            }

            // Calcular total
            const total = pagoInfo ? pagoInfo.total : carrito.reduce((sum, item) => sum + (item.precio * (item.cantidad || 1)), 0);

            console.log("🛒 Carrito a pagar:", carrito);
            console.log("💰 Total:", total);

            // Deshabilitar botón
            btnPagar.innerText = "Procesando...";
            btnPagar.disabled = true;

            try {
                // Preparar datos del pedido para el backend
                const pedidoData = {
                    usuario: {
                        nombre: user.nombre,
                        correo: user.correo,
                        direccion: direccion
                    },
                    productos: carrito.map(item => ({
                        nombre: item.nombre || item.name,
                        precio: item.precio || item.price,
                        cantidad: item.cantidad || 1,
                        imagen: item.imagen || item.image
                    })),
                    total: total,
                    metodoPago: metodo,
                    fecha: new Date().toISOString(),
                    estado: "pagado"
                };

                console.log("📦 Enviando pedido:", pedidoData);

                // Enviar al backend para guardar el pedido
                const response = await fetch('https://luxe-api-frr5.onrender.com/api/orders/crear', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(pedidoData)
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || 'Error al procesar el pedido');
                }

                const data = await response.json();
                console.log("✅ Pedido guardado:", data);

                // ============================================
                // 🔥 REDUCIR STOCK DE CADA PRODUCTO VENDIDO
                // ============================================
                console.log("🔄 Reduciendo stock de productos...");

                for (const item of carrito) {
                    try {
                        const productoId = item.id || item._id;
                        
                        if (!productoId) {
                            console.warn(`⚠️ Producto sin ID: ${item.nombre || item.name}`);
                            continue;
                        }

                        console.log(`➖ Reduciendo stock para ${item.nombre || item.name} (ID: ${productoId})`);

                        const stockResponse = await fetch(`https://luxe-api-frr5.onrender.com/api/products/reducir-stock/${productoId}`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify({ 
                                cantidad: item.cantidad || 1 
                            })
                        });

                        if (stockResponse.ok) {
                            const stockData = await stockResponse.json();
                            console.log(`✅ Stock actualizado: ${item.nombre || item.name} ahora tiene ${stockData.nuevoStock} unidades`);
                        } else {
                            const error = await stockResponse.json();
                            console.error(`❌ Error con ${item.nombre || item.name}:`, error);
                        }
                    } catch (error) {
                        console.error(`❌ Error de red para ${item.nombre || item.name}:`, error);
                    }
                }

                console.log("✅ Reducción de stock completada");
                // ============================================
                // FIN REDUCCIÓN DE STOCK
                // ============================================

                // Guardar ticket
                localStorage.setItem("ticket", JSON.stringify({
                    id: data.pedido?.id || Date.now(),
                    fecha: new Date().toISOString(),
                    cliente: user.nombre,
                    correo: user.correo,
                    direccion: direccion,
                    metodoPago: metodo,
                    total: total,
                    productos: carrito.map(item => ({
                        nombre: item.nombre || item.name,
                        precio: item.precio || item.price,
                        cantidad: item.cantidad || 1
                    }))
                }));

                // Limpiar carrito
                localStorage.removeItem("carrito");
                localStorage.removeItem("totalAPagar");

                // Mostrar éxito con SweetAlert si está disponible
                if (typeof Swal !== 'undefined') {
                    Swal.fire({
                        icon: 'success',
                        title: '¡Compra confirmada!',
                        text: 'Tu pago fue procesado exitosamente',
                        confirmButtonColor: '#ff4d6d',
                        timer: 2000,
                        showConfirmButton: false
                    }).then(() => {
                        window.location.href = "ticket.html";
                    });
                } else {
                    alert("✅ ¡Compra confirmada!");
                    window.location.href = "ticket.html";
                }

            } catch (error) {
                console.error("❌ Error completo:", error);
                
                if (typeof Swal !== 'undefined') {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: error.message || 'Error al procesar el pago',
                        confirmButtonColor: '#ff4d6d'
                    });
                } else {
                    alert(`❌ Error: ${error.message}`);
                }
                
                btnPagar.innerText = "Confirmar Pago";
                btnPagar.disabled = false;
            }
        });
    }

    // Función para actualizar la barra de progreso
    function actualizarProgreso(paso) {
        const steps = document.querySelectorAll('.progress-step');
        steps.forEach((step, index) => {
            if (index < paso) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });
    }

    // Función para mostrar toast (notificaciones temporales)
    function mostrarToast(mensaje) {
        // Verificar si SweetAlert está disponible
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: 'info',
                title: mensaje,
                timer: 2000,
                showConfirmButton: false,
                position: 'top-end',
                toast: true
            });
        } else {
            // Fallback a alert tradicional
            alert(mensaje);
        }
    }

    // Formatear número de tarjeta mientras se escribe
    const numeroTarjeta = document.getElementById("numeroTarjeta");
    if (numeroTarjeta) {
        numeroTarjeta.addEventListener("input", function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 16) value = value.slice(0, 16);
            
            // Agregar espacios cada 4 dígitos
            let formatted = '';
            for (let i = 0; i < value.length; i++) {
                if (i > 0 && i % 4 === 0) formatted += ' ';
                formatted += value[i];
            }
            e.target.value = formatted;
        });
    }

    // Formatear fecha de expiración
    const expira = document.getElementById("expira");
    if (expira) {
        expira.addEventListener("input", function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 4) value = value.slice(0, 4);
            
            if (value.length >= 3) {
                e.target.value = value.slice(0, 2) + '/' + value.slice(2);
            } else {
                e.target.value = value;
            }
        });
    }

    // Limitar CVV a 3-4 dígitos
    const cvv = document.getElementById("cvvTarjeta");
    if (cvv) {
        cvv.addEventListener("input", function(e) {
            e.target.value = e.target.value.replace(/\D/g, '').slice(0, 4);
        });
    }
});

// Función para newsletter (si existe)
function suscribirse() {
    const email = document.getElementById('newsletter-email').value;
    if (email && email.includes('@')) {
        mostrarToast('¡Gracias por suscribirte!');
        document.getElementById('newsletter-email').value = '';
    } else {
        mostrarToast('Por favor ingresa un email válido');
    }
}