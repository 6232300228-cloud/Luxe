// checkout.js

document.addEventListener("DOMContentLoaded", () => {
    const metodoPago = document.getElementById("metodoPago");
    const tarjetaBox = document.getElementById("tarjetaBox");
    const paypalBox = document.getElementById("paypalBox");
    const btnPagar = document.getElementById("btnPagar");

    // Mostrar Totales al cargar
    const pagoInfo = JSON.parse(localStorage.getItem("totalAPagar"));
    if (pagoInfo) {
        document.getElementById("resumen-subtotal").innerText = `$${pagoInfo.subtotal.toFixed(2)}`;
        document.getElementById("resumen-envio").innerText = pagoInfo.envio === 0 ? "GRATIS" : `$${pagoInfo.envio.toFixed(2)}`;
        document.getElementById("resumen-total").innerText = `$${pagoInfo.total.toFixed(2)}`;
    }

    // Visibilidad de métodos
    metodoPago.addEventListener("change", () => {
        tarjetaBox.style.display = (metodoPago.value === "tarjeta") ? "block" : "none";
        paypalBox.style.display = (metodoPago.value === "paypal") ? "block" : "none";
    });

    // Obtener usuario del localStorage
    let user = JSON.parse(localStorage.getItem("user"));
    let token = localStorage.getItem("token");

    if (user) {
        if(document.getElementById("correo")) document.getElementById("correo").value = user.correo;
        if(document.getElementById("nombre")) document.getElementById("nombre").value = user.nombre || "";
        if(document.getElementById("direccion")) document.getElementById("direccion").value = user.direccion || "";
    }

    btnPagar.addEventListener("click", async () => {
        // Verificar usuario logueado
        if (!user || !token) { 
            alert("⚠️ Inicia sesión primero"); 
            window.location.href = "login.html"; 
            return; 
        }

        const nombre = document.getElementById("nombre").value;
        const direccion = document.getElementById("direccion").value;
        const correo = document.getElementById("correo").value;
        const metodo = metodoPago.value;

        if (!nombre || !direccion || !correo || !metodo) { 
            alert("⚠️ Completa todos los datos"); 
            return; 
        }

        let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
        if (carrito.length === 0) { 
            alert("⚠️ Tu carrito está vacío"); 
            return; 
        }

        // 🔥 ENVIAR PEDIDO A MONGODB
        btnPagar.innerText = "Procesando... ✨";
        btnPagar.disabled = true;

        try {
            // Preparar los datos para enviar al backend
            const pedidoData = {
                metodoPago: metodo,
                direccionEntrega: direccion,
                notas: ""
            };

            // Enviar petición al backend
            const response = await fetch('http://localhost:3000/api/orders/crear', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(pedidoData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error al procesar el pedido');
            }

            // 🔥 Crear ticket para mostrar después
            const ticketInfo = {
                id: data.pedido.id,
                fecha: new Date().toLocaleString(),
                total: pagoInfo ? pagoInfo.total : carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0),
                metodoPago: metodo,
                correo: correo,
                cliente: nombre,
                direccion: direccion,
                productos: carrito
            };

            // Guardar ticket temporalmente
            localStorage.setItem("ticket", JSON.stringify(ticketInfo));

            // Limpiar carrito y total
            localStorage.removeItem("carrito");
            localStorage.removeItem("totalAPagar");

            alert("✅ ¡Compra confirmada! 💖");
            window.location.href = "ticket.html";

        } catch (error) {
            console.error('Error al procesar pedido:', error);
            alert("❌ Error al procesar el pedido: " + error.message);
            btnPagar.innerText = "Confirmar Pago 💖";
            btnPagar.disabled = false;
        }
    });
});