// ============================================
// FUNCIONES DEL HEADER
// ============================================

// Toggle menú hamburguesa
function toggleMenu() {
  const menu = document.getElementById('side-menu');
  if (menu) menu.classList.toggle('active');
}

// ============================================
// MEJORAS PARA EL MENÚ HAMBURGUESA
// ============================================

// 1. CERRAR AL HACER CLIC FUERA
document.addEventListener('click', function(event) {
  const menu = document.getElementById('side-menu');
  const hamburger = document.querySelector('.menu-hamburger');
  
  // Si el menú está activo y el clic NO fue en el menú NI en el hamburguesa
  if (menu && menu.classList.contains('active') && 
      !menu.contains(event.target) && 
      !hamburger.contains(event.target)) {
    menu.classList.remove('active');
  }
});

// 2. ABRIR AL PASAR EL CURSOR SOBRE EL HAMBURGUESA (SOLO DESKTOP)
if (window.innerWidth > 768) {
  const hamburger = document.querySelector('.menu-hamburger');
  const menu = document.getElementById('side-menu');
  
  if (hamburger && menu) {
    let hoverTimer;
    
    // Al entrar al hamburguesa
    hamburger.addEventListener('mouseenter', function() {
      hoverTimer = setTimeout(() => {
        menu.classList.add('active');
      }, 200); // Pequeño delay
    });
    
    // Al salir del hamburguesa, cancelar si no se abrió
    hamburger.addEventListener('mouseleave', function() {
      clearTimeout(hoverTimer);
    });
    
    // Opcional: cerrar al salir del menú (si quieres)
    menu.addEventListener('mouseleave', function() {
      // Si quieres que se cierre al salir, descomenta:
      // menu.classList.remove('active');
    });
  }
}

// ============================================
// FUNCIONES PARA EL FOOTER (NEWSLETTER)
// ============================================
function suscribirse() {
  const email = document.getElementById('newsletter-email').value;
  const toast = document.getElementById('toast');
  
  if (email && email.includes('@')) {
    // Mostrar mensaje de éxito
    if (toast) {
      toast.textContent = "¡Gracias por suscribirte!";
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 2000);
    } else {
      alert("¡Gracias por suscribirte!");
    }
    document.getElementById('newsletter-email').value = '';
  } else {
    // Mostrar mensaje de error
    if (toast) {
      toast.textContent = "Por favor ingresa un email válido";
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 2000);
    } else {
      alert("Por favor ingresa un email válido");
    }
  }
}

// ============================================
// ANIMACIONES SUAVES AL HACER SCROLL
// ============================================
document.addEventListener('DOMContentLoaded', function() {
  // Observador para animar las tarjetas cuando aparecen
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.1 });
  
  // Observar las tarjetas de valores
  document.querySelectorAll('.value-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'all 0.6s ease';
    observer.observe(card);
  });
});

// ============================================
// INICIALIZACIÓN
// ============================================
document.addEventListener('DOMContentLoaded', function() {
  console.log('Página Nosotros cargada');
  
  // Actualizar contadores del header si existen
  const favCount = document.getElementById('fav-count');
  const cartCount = document.getElementById('cart-count');
  
  if (favCount) {
    const favs = JSON.parse(localStorage.getItem('favs')) || [];
    favCount.textContent = favs.length;
  }
  
  if (cartCount) {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const total = carrito.reduce((sum, item) => sum + (item.cantidad || 1), 0);
    cartCount.textContent = total;
  }
});