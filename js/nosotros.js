// ============================================
// FUNCIONES DEL HEADER
// ============================================

function toggleMenu() {
  const menu = document.getElementById('side-menu');
  if (menu) menu.classList.toggle('active');
}

// ============================================
// CERRAR MENU AL HACER CLIC FUERA
// ============================================

document.addEventListener('click', function(event) {
  const menu = document.getElementById('side-menu');
  const hamburger = document.querySelector('.menu-hamburger');
  
  if (menu && menu.classList.contains('active') && 
      !menu.contains(event.target) && 
      !hamburger.contains(event.target)) {
    menu.classList.remove('active');
  }
});

// ============================================
// ABRIR CON HOVER EN DESKTOP
// ============================================

if (window.innerWidth > 768) {
  const hamburger = document.querySelector('.menu-hamburger');
  const menu = document.getElementById('side-menu');
  
  if (hamburger && menu) {
    let hoverTimer;
    
    hamburger.addEventListener('mouseenter', function() {
      hoverTimer = setTimeout(() => {
        menu.classList.add('active');
      }, 200);
    });
    
    hamburger.addEventListener('mouseleave', function() {
      clearTimeout(hoverTimer);
    });
  }
}

// ============================================
// ACTUALIZAR CONTADORES DEL HEADER
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
    const total = carrito.reduce((sum, item) => sum + (item.cantidad || 1), 0);
    cartCount.textContent = total;
    cartCount.setAttribute("data-count", total);
  }
}

// ============================================
// ANIMACIONES SUAVES AL HACER SCROLL
// ============================================

document.addEventListener('DOMContentLoaded', function() {
  actualizarContadores();
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.1 });
  
  document.querySelectorAll('.value-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'all 0.6s ease';
    observer.observe(card);
  });
});