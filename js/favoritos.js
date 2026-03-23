const favItems = document.getElementById("fav-items");

// Función del contador (Sincronización del icono del carrito en el header)
function actualizarContadorCarrito() {
  const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  const contador = document.getElementById("cart-count");
  

  if (contador) {
    const total = carrito.length;
    
    // Seteo del atributo para el CSS (ocultar si es 0)
    contador.setAttribute("data-count", total);
    
    if (total > 0) {
      contador.innerText = total;
      // Efecto pulso
      contador.classList.remove("pulse");
      void contador.offsetWidth; // Reinicio de animación
      contador.classList.add("pulse");
    } else {
      contador.innerText = "";
    }
  }
}
function toggleMenu() {
  const menu = document.getElementById('side-menu');
  if (menu) menu.classList.toggle('active');
}
// Agrega esta función a tu archivo favoritos.js
function vaciarFavoritos() {
    if (confirm("¿Quieres vaciar todos tus favoritos?")) {
        localStorage.setItem("favs", JSON.stringify([]));
        renderFavs();
        actualizarContadorCarrito();
        
        // Mostrar notificación opcional
        mostrarToast("Todos los favoritos han sido eliminados");
    }
}

// Función para mostrar notificación (opcional)
function mostrarToast(mensaje) {
    let toast = document.getElementById("toast");
    if (!toast) {
        toast = document.createElement("div");
        toast.id = "toast";
        toast.style.cssText = `
            position: fixed;
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%);
            background: #333;
            color: white;
            padding: 12px 24px;
            border-radius: 50px;
            font-size: 14px;
            z-index: 1000;
            opacity: 0;
            transition: opacity 0.3s;
            pointer-events: none;
        `;
        document.body.appendChild(toast);
    }
    
    toast.textContent = mensaje;
    toast.style.opacity = "1";
    
    setTimeout(() => {
        toast.style.opacity = "0";
    }, 3000);
}

// Agregar el event listener al botón de vaciar
document.addEventListener('DOMContentLoaded', function() {
    const vaciarBtn = document.getElementById("vaciar-favoritos-btn");
    if (vaciarBtn) {
        vaciarBtn.addEventListener("click", vaciarFavoritos);
    }
});
function renderFavs() {
  let favs = JSON.parse(localStorage.getItem("favs")) || [];
  favItems.innerHTML = "";

  // Si no hay favoritos, muestra el mensaje con el estilo del carrito vacío
  if (favs.length === 0) {
    favItems.innerHTML = `
        <div style="text-align:center; padding: 50px;">
            <h2>Aún no tienes favoritos </h2>
            <a href="index.html" style="color: #ff4d6d; font-weight:bold;">Ir a la tienda</a>
        </div>`;
    return;
  }

  // Si hay favoritos, renderiza las tarjetas
  favs.forEach((p, index) => {
    favItems.innerHTML += `
      <div class="card">
        <img src="${p.img}">
        <h4>${p.name}</h4>
        <p>$${p.price}</p>
        <button onclick="removeFav(${index})">Quitar</button>
      </div>
    `;
  });
}

function removeFav(index) {
  let favs = JSON.parse(localStorage.getItem("favs")) || [];
  favs.splice(index, 1);
  localStorage.setItem("favs", JSON.stringify(favs));
  
  renderFavs(); // Vuelve a renderizar para mostrar el mensaje de "vacío" si era el último
}

// Inicialización al cargar la página
renderFavs();
actualizarContadorCarrito();