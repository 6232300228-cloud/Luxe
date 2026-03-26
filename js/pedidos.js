// js/pedidos.js - VERSIÓN CON LOCALSTORAGE

function cargarPedidos() {
    const contenedor = document.getElementById("contenedor-pedidos");
    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    // Verificar si el usuario está logueado
    if (!token || !user) {
        contenedor.innerHTML = `
            <div style="text-align: center; padding: 60px 20px; background: white; border-radius: 20px;">
                <p>Necesitas iniciar sesión para ver el historial de tus compras.</p>
                <a href="login.html" style="display: inline-block; background: #ff4d6d; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; margin-top: 20px;">
                    Ir a iniciar sesión
                </a>
            </div>
        `;
        return;
    }

    // Cargar pedidos desde localStorage
    const pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
    
    // Filtrar pedidos del usuario actual (si el usuario tiene email o id)
    let pedidosUsuario = pedidos;
    
    // Si el usuario está logueado, filtrar por correo
    if (user.correo) {
        pedidosUsuario = pedidos.filter(p => p.envioData?.correo === user.correo);
    }

    if (pedidosUsuario.length === 0) {
        contenedor.innerHTML = `
            <div style="text-align: center; padding: 60px 20px; background: white; border-radius: 20px;">
                <h2 style="color: #ff4d6d;">Aún no tienes pedidos</h2>
                <p>Hola ${user.nombre || 'usuario'}, cuando realices tu primera compra, aparecerá aquí.</p>
                <a href="index.html" style="display: inline-block; background: #ff4d6d; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; margin-top: 20px;">
                    Ir a la tienda
                </a>
            </div>
        `;
        return;
    }

    // Mostrar los pedidos (ordenados del más reciente al más antiguo)
    contenedor.innerHTML = "";
    
    // Ordenar de más reciente a más antiguo
    pedidosUsuario.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    pedidosUsuario.forEach((pedido) => {
        const fecha = new Date(pedido.fecha).toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        let listaProductos = pedido.items.map(p => 
            `<li style="margin-bottom: 5px;">
                ${p.nombre} x${p.cantidad || 1} - $${Math.round(p.precio * (p.cantidad || 1))}
            </li>`
        ).join("");

        const estadoClass = {
            'pendiente': 'estado-pendiente',
            'pagado': 'estado-pagado',
            'enviado': 'estado-enviado',
            'entregado': 'estado-entregado',
            'cancelado': 'estado-cancelado'
        }[pedido.estado] || 'estado-pendiente';

        const estadoTexto = {
            'pendiente': 'PENDIENTE',
            'pagado': 'PAGADO',
            'enviado': 'ENVIADO',
            'entregado': 'ENTREGADO',
            'cancelado': 'CANCELADO'
        }[pedido.estado] || 'PENDIENTE';

        const metodoTexto = pedido.metodoPago === 'mercadopago' ? 'Mercado Pago' : 'Tarjeta';

        const div = document.createElement("div");
        div.className = "card-pedido";
        div.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; border-bottom: 1px solid #eee; padding-bottom: 15px;">
                <div>
                    <strong>Pedido #${pedido.id}</strong>
                    <p style="font-size: 12px; color: #666; margin: 5px 0 0 0;">${fecha}</p>
                </div>
                <span class="estado-badge ${estadoClass}">${estadoTexto}</span>
            </div>
            <div style="padding: 15px 0;">
                <p><strong>Dirección de envío:</strong> ${pedido.envioData?.direccion || 'No especificada'}</p>
                <p><strong>Método de pago:</strong> ${metodoTexto}</p>
            </div>
            <div>
                <p><strong>Productos:</strong></p>
                <ul style="font-size: 14px; color: #555; padding-left: 20px;">${listaProductos}</ul>
            </div>
            <div style="text-align: right; margin-top: 15px; padding-top: 15px; border-top: 2px solid #ff4d6d;">
                <strong style="font-size: 18px; color: #ff4d6d;">Total: $${Math.round(pedido.total)}</strong>
            </div>
        `;
        contenedor.appendChild(div);
    });
}

// Función para verificar admin y mostrar dashboard
function verificarAdmin() {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');
    const dashboardBtn = document.getElementById('dashboard-btn');
    
    if (dashboardBtn) {
        if (token && user && (user.role === 'admin' || user.role === 'empleado')) {
            dashboardBtn.style.display = 'flex';
        } else {
            dashboardBtn.style.display = 'none';
        }
    }
}

// Cargar pedidos al iniciar la página
document.addEventListener("DOMContentLoaded", function() {
    cargarPedidos();
    verificarAdmin();
    
    // Actualizar contadores
    const favCount = document.getElementById('fav-count');
    const cartCount = document.getElementById('cart-count');
    if (favCount) {
        const favs = JSON.parse(localStorage.getItem('favs')) || [];
        favCount.textContent = favs.length;
    }
    if (cartCount) {
        const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
        const totalItems = carrito.reduce((sum, item) => sum + (item.cantidad || 1), 0);
        cartCount.textContent = totalItems;
    }
});

// Exponer funciones globalmente
window.cargarPedidos = cargarPedidos;
window.verificarAdmin = verificarAdmin;