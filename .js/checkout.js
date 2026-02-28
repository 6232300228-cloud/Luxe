// checkout.js

document.addEventListener("DOMContentLoaded", () => {
    const metodoPago = document.getElementById("metodoPago");
    const tarjetaBox = document.getElementById("tarjetaBox");
    const paypalBox = document.getElementById("paypalBox");
    const btnPagar = document.getElementById("btnPagar");

    // Mostrar Totales del localStorage
    const pagoInfo = JSON.parse(localStorage.getItem("totalAPagar"));
    if (pagoInfo) {
        document.getElementById("resumen-subtotal").innerText = `$${pagoInfo.subtotal.toFixed(2)}`;
        document.getElementById("resumen-envio").innerText = pagoInfo.envio === 0 ? "GRATIS" : `$${pagoInfo.envio.toFixed(2)}`;
        document.getElementById("resumen-total").innerText = `$${pagoInfo.total.toFixed(2)}`;
    }

    // Visibilidad de métodos de pago
    metodoPago.addEventListener("change", () => {
        tarjetaBox.style.display = (metodoPago.value === "tarjeta") ? "block" : "none";
        paypalBox.style.display = (metodoPago.value === "paypal") ? "block" : "none";
    });

    // Cargar datos del usuario
    let user = JSON.parse(localStorage.getItem("user"));
    let token = localStorage.getItem("token");

    if (user) {
        if(document.getElementById("correo")) document.getElementById("correo").value = user.correo;
        if(document.getElementById("nombre")) document.getElementById("nombre").value = user.nombre || "";
        if(document.getElementById("direccion")) document.getElementById("direccion").value = user.direccion || "";
    }

    // PROCESAR PAGO
    btnPagar.addEventListener("click", async () => {
        // Verificar usuario
        if (!user || !token) { 
            alert("⚠️ Inicia sesión primero"); 
            window.location.href = "login.html"; 
            return; 
        }

        // Validar datos del formulario
        const nombre = document.getElementById("nombre").value;
        const direccion = document.getElementById("direccion").value;
        const correo = document.getElementById("correo").value;
        const metodo = metodoPago.value;

        if (!nombre || !direccion || !correo || !metodo) { 
            alert("⚠️ Completa todos los datos"); 
            return; 
        }

        // 🔥 IMPORTANTE: Obtener carrito de LOCALSTORAGE, NO de MongoDB
        const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
        
        if (carrito.length === 0) { 
            alert("❌ Error: El carrito está vacío"); 
            return; 
        }

        console.log("🛒 Carrito a pagar:", carrito);

        // Deshabilitar botón
        btnPagar.innerText = "Procesando... ✨";
        btnPagar.disabled = true;

        try {
            // Preparar datos del pedido
            const pedidoData = {
                usuario: {
                    nombre: user.nombre,
                    correo: user.correo,
                    direccion: direccion
                },
                productos: carrito.map(item => ({
                    nombre: item.nombre,
                    precio: item.precio,
                    cantidad: item.cantidad,
                    imagen: item.img
                })),
                total: pagoInfo ? pagoInfo.total : carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0),
                metodoPago: metodo,
                fecha: new Date().toISOString(),
                estado: "pagado"
            };

            console.log("📦 Enviando pedido:", pedidoData);

            // Enviar al backend
            const response = await fetch('http://localhost:3000/api/orders/crear', {
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

            // Guardar ticket
            localStorage.setItem("ticket", JSON.stringify({
                ...pedidoData,
                id: data.pedido?.id || Date.now()
            }));

            // LIMPIAR TODO
            localStorage.removeItem("carrito");
            localStorage.removeItem("totalAPagar");

            alert("✅ ¡Compra confirmada! 💖");
            window.location.href = "ticket.html";

        } catch (error) {
            console.error("❌ Error completo:", error);
            alert(`❌ Error: ${error.message}`);
            btnPagar.innerText = "Confirmar Pago 💖";
            btnPagar.disabled = false;
        }
    });
});