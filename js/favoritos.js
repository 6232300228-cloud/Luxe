// ============================================
// VARIABLES GLOBALES
// ============================================
const favItems = document.getElementById("fav-items");

// ============================================
// ACTUALIZAR CONTADORES DEL HEADER
// ============================================
function actualizarContadorCarrito() {
  const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  const contador = document.getElementById("cart-count");
  
  if (contador) {
    const total = carrito.length;
    contador.setAttribute("data-count", total);
    
    if (total > 0) {
      contador.innerText = total;
      contador.classList.remove("pulse");
      void contador.offsetWidth;
      contador.classList.add("pulse");
    } else {
      contador.innerText = "0";
    }
  }
}

function actualizarContadorFavoritos() {
  const favCount = document.getElementById("fav-count");
  let favsActual = JSON.parse(localStorage.getItem("favs")) || [];
  if (favCount) {
    favCount.textContent = favsActual.length;
    favCount.setAttribute("data-count", favsActual.length);
    if (favsActual.length > 0) {
      favCount.classList.remove("pulse");
      void favCount.offsetWidth;
      favCount.classList.add("pulse");
    }
  }
}

// ============================================
// MOSTRAR TOAST
// ============================================
function mostrarToast(mensaje) {
  let toast = document.getElementById("toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = mensaje;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2000);
}

// ============================================
// VACIAR FAVORITOS
// ============================================
function vaciarFavoritos() {
  if (confirm("¿Quieres vaciar todos tus favoritos?")) {
    localStorage.setItem("favs", JSON.stringify([]));
    renderFavs();
    actualizarContadorCarrito();
    actualizarContadorFavoritos();
    mostrarToast("Todos los favoritos han sido eliminados");
  }
}

// ============================================
// ELIMINAR FAVORITO INDIVIDUAL
// ============================================
function removeFav(index) {
  let favs = JSON.parse(localStorage.getItem("favs")) || [];
  favs.splice(index, 1);
  localStorage.setItem("favs", JSON.stringify(favs));
  renderFavs();
  actualizarContadorFavoritos();
  mostrarToast("Producto eliminado de favoritos");
}

// ============================================
// RENDERIZAR FAVORITOS
// ============================================
function renderFavs() {
  let favs = JSON.parse(localStorage.getItem("favs")) || [];
  const favItems = document.getElementById("fav-items");
  const vaciarBtn = document.getElementById("vaciar-favoritos-btn");
  
  favItems.innerHTML = "";

  if (favs.length === 0) {
    if (vaciarBtn) {
      vaciarBtn.style.display = "none";
    }
    favItems.classList.remove("products-grid");
    favItems.style.display = "block";
    favItems.innerHTML = `
      <div style="text-align: center; padding: 60px 20px;">
        <h2 style="font-family: 'Playfair Display', serif; font-size: 22px; color: #000000; margin-bottom: 20px;">Aún no tienes favoritos</h2>
        <a href="index.html" style="color: #ff4d6d; font-weight: bold; text-decoration: none; display: inline-block;">Ir a la tienda</a>
      </div>
    `;
    return;
  }

  if (vaciarBtn) {
    vaciarBtn.style.display = "block";
  }
  
  favItems.classList.add("products-grid");
  favItems.style.display = "grid";

  favs.forEach((p, index) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="${p.img}">
      <h4>${p.name}</h4>
      <p>$${p.price}</p>
      <button class="remove-fav-btn" data-index="${index}">Quitar</button>
    `;
    favItems.appendChild(card);
  });
  
  document.querySelectorAll('.remove-fav-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      const index = parseInt(this.getAttribute('data-index'));
      this.style.transform = "scale(0.95)";
      setTimeout(() => {
        this.style.transform = "scale(1)";
      }, 150);
      removeFav(index);
    });
  });
}

// ============================================
// MENU HAMBURGUESA
// ============================================
function toggleMenu() {
  const menu = document.getElementById('side-menu');
  if (menu) menu.classList.toggle('active');
}

document.addEventListener('click', function(event) {
  const menu = document.getElementById('side-menu');
  const hamburger = document.querySelector('.menu-hamburger');
  
  if (menu && menu.classList.contains('active') && 
      !menu.contains(event.target) && 
      !hamburger.contains(event.target)) {
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
// INICIALIZAR
// ============================================
document.addEventListener('DOMContentLoaded', function() {
  const vaciarBtn = document.getElementById("vaciar-favoritos-btn");
  if (vaciarBtn) {
    vaciarBtn.addEventListener("click", vaciarFavoritos);
  }
  renderFavs();
  actualizarContadorCarrito();
  actualizarContadorFavoritos();
});