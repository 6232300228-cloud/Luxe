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

    let user = JSON.parse(localStorage.getItem("user"));
    if (user) {
        if(document.getElementById("correo")) document.getElementById("correo").value = user.correo;
        if(document.getElementById("nombre")) document.getElementById("nombre").value = user.nombre || "";
    }

    btnPagar.addEventListener("click", () => {
        if (!user) { alert("⚠️ Inicia sesión primero"); window.location.href = "login.html"; return; }

        const nombre = document.getElementById("nombre").value;
        const direccion = document.getElementById("direccion").value;
        const correo = document.getElementById("correo").value;
        const metodo = metodoPago.value;

        if (!nombre || !direccion || !correo || !metodo) { alert("⚠️ Completa los datos"); return; }

        let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
        if (carrito.length === 0) { alert("⚠️ Carrito vacío"); return; }

        // Pedido Final
        let nuevoPedido = {
            id: Date.now(),
            fecha: new Date().toLocaleString(),
            total: pagoInfo ? pagoInfo.total.toFixed(2) : 0,
            metodoPago: metodo,
            correo: correo,
            cliente: nombre,
            direccion: direccion,
            productos: carrito
        };

        btnPagar.innerText = "Procesando... ✨";
        btnPagar.disabled = true;

        setTimeout(() => {
            let pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];
            pedidos.push(nuevoPedido);
            localStorage.setItem("pedidos", JSON.stringify(pedidos));
            localStorage.setItem("ticket", JSON.stringify(nuevoPedido));
            localStorage.removeItem("carrito");
            localStorage.removeItem("totalAPagar");

            alert("✅ Compra confirmada 💖");
            window.location.href = "ticket.html";
        }, 2000);
    });
});