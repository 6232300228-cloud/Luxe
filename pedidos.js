function cargarPedidos() {
    const contenedor = document.getElementById("contenedor-pedidos");
    
    const user = JSON.parse(localStorage.getItem("user"));
    
    const todosLosPedidos = JSON.parse(localStorage.getItem("pedidos")) || [];

    //  Solo los pedidos que pertenecen al correo del usuario actual
    const misPedidos = todosLosPedidos.filter(p => p.correo === user.correo);

    if (misPedidos.length === 0) {
        contenedor.innerHTML = `
            <div class="card">
                <p>Hola ${user.nombre}, aún no has realizado ninguna compra con esta cuenta. 💄</p>
                <a href="index.html" style="color: #ff4d6d; font-weight: bold;">¡Ir de compras!</a>
            </div>`;
        return;
    }

    contenedor.innerHTML = "";

    misPedidos.reverse().forEach((pedido) => {
        const div = document.createElement("div");
        div.classList.add("card-pedido");
        
        let listaProductos = pedido.productos.map(p => `<li>${p.nombre} (x${p.cantidad || 1})</li>`).join("");

        div.innerHTML = `
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #eee; padding-bottom: 10px;">
                <span><b>Fecha:</b> ${pedido.fecha}</span>
                <span style="color: #ff4d6d; font-weight: bold;">Total: $${pedido.total}</span>
            </div>
            <div style="padding-top: 10px; text-align: left;">
                <p><b>Productos:</b></p>
                <ul style="font-size: 14px; color: #555; padding-left: 20px;">
                    ${listaProductos}
                </ul>
                <p style="font-size: 12px; color: #888; margin-top: 10px;">Enviado a: ${pedido.direccion}</p>
            </div>
        `;
        contenedor.appendChild(div);
    });
}

document.addEventListener("DOMContentLoaded", cargarPedidos);