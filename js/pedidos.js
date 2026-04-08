// ============================================
// FUNCIONES DEL HEADER
// ============================================

function toggleMenu() {
    const menu = document.getElementById('side-menu');
    if (menu) menu.classList.toggle('active');
}

document.addEventListener('click', function(event) {
    const menu = document.getElementById('side-menu');
    const hamburger = document.querySelector('.menu-hamburger');
    if (menu && menu.classList.contains('active') && !menu.contains(event.target) && !hamburger.contains(event.target)) {
        menu.classList.remove('active');
    }
});

if (window.innerWidth > 768) {
    const hamburger = document.querySelector('.menu-hamburger');
    const menu = document.getElementById('side-menu');
    if (hamburger && menu) {
        let hoverTimer;
        hamburger.addEventListener('mouseenter', function() {
            hoverTimer = setTimeout(() => menu.classList.add('active'), 200);
        });
        hamburger.addEventListener('mouseleave', function() {
            clearTimeout(hoverTimer);
        });
    }
}

// ============================================
// ACTUALIZAR CONTADORES
// ============================================

function actualizarContadores() {
    const favCount = document.getElementById('fav-count');
    const cartCount = document.getElementById('cart-count');
    if (favCount) {
        const favs = JSON.parse(localStorage.getItem('favs')) || [];
        favCount.textContent = favs.length;
        favCount.setAttribute("data-count", favs.length);
    }
    if (cartCount) {
        const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
        const totalItems = carrito.reduce((sum, item) => sum + (item.cantidad || 1), 0);
        cartCount.textContent = totalItems;
        cartCount.setAttribute("data-count", totalItems);
    }
}

// ============================================
// USUARIO Y SESSION
// ============================================

function cargarUsuario() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    const loginBtn = document.getElementById('login-btn');
    const userMenu = document.getElementById('user-menu');
    const userNameSpan = document.getElementById('user-name');
    if (token && user) {
        if (loginBtn) loginBtn.style.display = 'none';
        if (userMenu) userMenu.style.display = 'block';
        if (userNameSpan) {
            const nombre = user.nombre || user.email || 'Usuario';
            userNameSpan.textContent = nombre.split(' ')[0];
        }
    } else {
        if (loginBtn) loginBtn.style.display = 'flex';
        if (userMenu) userMenu.style.display = 'none';
    }
}

function cerrarSesion() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

// ============================================
// CARGAR PEDIDOS
// ============================================

async function cargarPedidos() {
    const contenedor = document.getElementById("contenedor-pedidos");
    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

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

    let todosPedidos = [];
    
    const pedidosLocal = JSON.parse(localStorage.getItem('pedidos')) || [];
    const pedidosFiltradosLocal = pedidosLocal.filter(p => p.envioData?.correo === user.correo);
    todosPedidos.push(...pedidosFiltradosLocal);
    
    try {
        const response = await fetch('https://luxe-api-frr5.onrender.com/api/orders/mis-pedidos', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            const pedidosBackend = await response.json();
            todosPedidos.push(...pedidosBackend);
        }
    } catch (error) {
        console.error('Error cargando pedidos del backend:', error);
    }
    
    const pedidosUnicos = [];
    const ids = new Set();
    for (const pedido of todosPedidos) {
        const id = pedido._id || pedido.id;
        if (!ids.has(id)) {
            ids.add(id);
            pedidosUnicos.push(pedido);
        }
    }
    
    pedidosUnicos.sort((a, b) => {
        const fechaA = new Date(a.fechaPedido || a.fecha);
        const fechaB = new Date(b.fechaPedido || b.fecha);
        return fechaB - fechaA;
    });
    
    if (pedidosUnicos.length === 0) {
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
    
    contenedor.innerHTML = "";
    
    pedidosUnicos.forEach((pedido) => {
        const fecha = new Date(pedido.fechaPedido || pedido.fecha).toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const items = pedido.items || pedido.productos || [];
        
        let listaProductos = items.map(p => 
            `<li style="margin-bottom: 5px;">
                ${p.nombre} x${p.cantidad || 1} - $${Math.round((p.precio || 0) * (p.cantidad || 1))}
            </li>`
        ).join("");
        
        const estado = pedido.estado || 'pendiente';
        const estadoClass = {
            'pendiente': 'estado-pendiente',
            'pagado': 'estado-pagado',
            'enviado': 'estado-enviado',
            'entregado': 'estado-entregado',
            'cancelado': 'estado-cancelado'
        }[estado] || 'estado-pendiente';
        
        const estadoTexto = {
            'pendiente': 'PENDIENTE',
            'pagado': 'PAGADO',
            'enviado': 'ENVIADO',
            'entregado': 'ENTREGADO',
            'cancelado': 'CANCELADO'
        }[estado] || 'PENDIENTE';
        
        const metodoTexto = pedido.metodoPago === 'mercadopago' ? 'Mercado Pago' : 'Tarjeta';
        const direccion = pedido.envioData?.direccion || pedido.usuario?.direccion || 'No especificada';
        const idPedido = pedido._id || pedido.id;
        
        const div = document.createElement("div");
        div.className = "card-pedido";
        div.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; border-bottom: 1px solid #eee; padding-bottom: 15px;">
                <div>
                    <strong>Pedido #${typeof idPedido === 'string' ? idPedido.slice(-8) : idPedido}</strong>
                    <p style="font-size: 12px; color: #666; margin: 5px 0 0 0;">${fecha}</p>
                </div>
                <span class="estado-badge ${estadoClass}">${estadoTexto}</span>
            </div>
            <div style="padding: 15px 0;">
                <p><strong>Dirección de envío:</strong> ${direccion}</p>
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

// ============================================
// VERIFICAR ADMIN PARA DASHBOARD
// ============================================

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

// ============================================
// INICIALIZAR
// ============================================

document.addEventListener("DOMContentLoaded", function() {
    actualizarContadores();
    cargarUsuario();
    cargarPedidos();
    verificarAdmin();
    
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) logoutBtn.addEventListener('click', cerrarSesion);
});

window.toggleMenu = toggleMenu;
window.cargarPedidos = cargarPedidos;