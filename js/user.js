// ============================================
// user.js (FRONTEND) - Manejo del usuario
// ============================================

// Función para obtener el primer nombre
function getPrimerNombre(nombreCompleto) {
    if (!nombreCompleto) return "Usuario";
    return nombreCompleto.split(' ')[0];
}
// Función para verificar si el usuario es admin y mostrar el botón dashboard
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

// Llamar esta función cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    // ... tu código existente ...
    verificarAdmin();
});
// Función para actualizar la UI del usuario
function actualizarUIUsuario() {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));
    const loginBtn = document.getElementById("login-btn");
    const userMenu = document.getElementById("user-menu");
    const userNameElement = document.getElementById("user-name");

    if (token && user) {
        // Usuario logueado - mostrar menú
        if (loginBtn) loginBtn.style.display = "none";
        if (userMenu) {
            userMenu.style.display = "inline-block";
            if (userNameElement) {
                userNameElement.textContent = getPrimerNombre(user.nombre);
            }
        }
    } else {
        // Usuario no logueado - mostrar botón login
        if (loginBtn) loginBtn.style.display = "flex";
        if (userMenu) userMenu.style.display = "none";
    }
    
    actualizarContadores();
}

// Actualizar contadores de favoritos y carrito
function actualizarContadores() {
    const favs = JSON.parse(localStorage.getItem("favs")) || [];
    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    
    document.getElementById("fav-count").textContent = favs.length;
    document.getElementById("cart-count").textContent = 
        carrito.reduce((acc, item) => acc + (item.cantidad || 1), 0);
}

// Cerrar sesión
function logout() {
    if (confirm("¿Cerrar sesión?")) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        actualizarUIUsuario();
        window.location.href = "index.html";
    }
}

// Procesar token de Google al cargar
(function() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (token) {
        localStorage.setItem("token", token);
        
        fetch('https://luxe-api-frr5.onrender.com/api/auth/me', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(user => {
            localStorage.setItem("user", JSON.stringify(user));
            actualizarUIUsuario();
            
            // Limpiar URL
            window.history.replaceState({}, document.title, window.location.pathname);
        })
        .catch(console.error);
    }
})();

// Inicializar al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    actualizarUIUsuario();
    
    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) logoutBtn.addEventListener("click", logout);
});