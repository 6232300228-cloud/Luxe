// ============================================
// VARIABLES GLOBALES
// ============================================
let products = [];
let filtered = [];
let selectedBrand = "all";
let selectedCategory = "all";
const productList = document.getElementById("product-list");
const cartCount = document.getElementById("cart-count");
const favCount = document.getElementById("fav-count");
const search = document.getElementById("search");
const sortSelect = document.getElementById("sort");

// URL de la API
const API_URL = 'https://luxe-api-frr5.onrender.com/api/products';

// ============================================
// CARGAR PRODUCTOS DESDE LA API
// ============================================
async function cargarProductosDesdeAPI() {
    try {
        console.log('Cargando productos desde la API...');
        
        if (productList) {
            productList.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:50px;">Cargando productos...</div>';
        }
        
        const response = await fetch(API_URL);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const productosAPI = await response.json();
        console.log('Productos cargados:', productosAPI.length);
        
        products = productosAPI.map(p => ({
            id: p.id,
            name: p.name,
            price: p.price,
            img: p.img,
            category: p.category,
            brand: p.brand,
            desc: p.desc,
            stock: p.stock
        }));
        
        filtered = [...products];
        renderProducts();
        updateCartCounter();
        updateFavCounter();
        
        localStorage.setItem('ultimaCargaProductos', Date.now().toString());
        localStorage.removeItem('productosActualizados');
        
    } catch (error) {
        console.error('Error cargando productos:', error);
        if (productList) {
            productList.innerHTML = `
                <div style="grid-column:1/-1; text-align:center; padding:50px;">
                    Error al cargar productos<br>
                    <small>${error.message}</small><br>
                    <button onclick="cargarProductosDesdeAPI()" style="margin-top:15px; padding:8px 20px; background:#ff4d6d; color:white; border:none; border-radius:25px; cursor:pointer;">
                        Reintentar
                    </button>
                </div>
            `;
        }
    }
}

// ============================================
// FUNCIONES AUXILIARES
// ============================================
function getCategoryName(category) {
  const categories = {
    'labial': 'Labios',
    'sombra': 'Sombras',
    'base': 'Bases',
    'corrector': 'Correctores',
    'rubor': 'Rubores',
    'iluminador': 'Iluminador',
    'ojos': 'Ojos',
    'skincare': 'Skincare',
    'accesorios': 'Accesorios'
  };
  return categories[category] || category || 'General';
}

function showToast(msg) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2000);
}

// ============================================
// MODAL DE PRODUCTO
// ============================================
// ============================================
// MODAL DE PRODUCTO (sin mostrar stock numérico)
// ============================================
function openProductModal(productId) {
  const modal = document.getElementById("productModal");
  const modalContent = document.getElementById("modalProductDetail");
  
  let product = products.find(p => p.id == productId);
  
  if (!product) {
    console.log("Producto no encontrado:", productId);
    return;
  }
  
  // Determinar texto de disponibilidad
  let stockText = "";
  let stockClass = "";
  if (product.stock <= 0) {
    stockText = "AGOTADO";
    stockClass = "stock-agotado";
  } else if (product.stock <= 5) {
    stockText = " ÚLTIMAS PIEZAS ";
    stockClass = "stock-ultimas";
  } else {
    stockText = "DISPONIBLE AHORA";
    stockClass = "stock-disponible";
  }
  
  modalContent.innerHTML = `
    <div class="modal-product-img">
      <img src="${product.img}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/300'">
    </div>
    <div class="modal-product-info">
      <span class="modal-brand">${(product.brand || 'LUXE').toUpperCase()}</span>
      <h2>${product.name}</h2>
      <div class="modal-category">${getCategoryName(product.category)}</div>
      <p class="modal-description">${product.desc || 'Producto de alta calidad para realzar tu belleza natural.'}</p>
      <div class="modal-price">$${product.price}</div>
      <div class="modal-stock-status ${stockClass}" style="margin:10px 0; font-size:14px; font-weight:bold;">
        ${stockText}
      </div>
      <div class="modal-buttons">
        <button class="btn-modal-add" onclick="addToCartFromModal(${product.id})" ${product.stock <= 0 ? 'disabled style="opacity:0.5;"' : ''}>Agregar al carrito</button>
        <button class="btn-modal-close" onclick="buyNow(${product.id})" ${product.stock <= 0 ? 'disabled style="opacity:0.5;"' : ''}>Comprar ahora</button>
      </div>
    </div>
  `;
  
  modal.style.display = "flex";
  document.body.style.overflow = "hidden";
}

function closeProductModal() {
  const modal = document.getElementById("productModal");
  if (modal) modal.style.display = "none";
  document.body.style.overflow = "auto";
}

function addToCartFromModal(id) {
  addToCart(id);
  showToast("Producto agregado al carrito");
  closeProductModal();
}

// ============================================
// COMPRAR AHORA
// ============================================
function buyNow(productId) {
  let product = products.find(p => p.id == productId);
  
  if (!product) {
    showToast("Producto no encontrado");
    return;
  }
  
  if (product.stock <= 0) {
    showToast("Producto agotado");
    return;
  }
  
  const carritoUnico = [{
    id: product.id,
    nombre: product.name,
    precio: product.price,
    img: product.img,
    cantidad: 1
  }];
  
  localStorage.setItem("carrito", JSON.stringify(carritoUnico));
  window.location.href = "checkout.html";
  closeProductModal();
}

// ============================================
// CARRITO
// ============================================
function updateCartCounter() {
  if (!cartCount) return;
  let cart = JSON.parse(localStorage.getItem("carrito")) || [];
  const total = cart.reduce((sum, item) => sum + (item.cantidad || 1), 0);
  cartCount.textContent = total;
  cartCount.setAttribute("data-count", total);
  
  if (total > 0) {
    cartCount.classList.remove("pulse");
    void cartCount.offsetWidth;
    cartCount.classList.add("pulse");
  }
}

function addToCart(id) {
  let cart = JSON.parse(localStorage.getItem("carrito")) || [];
  let product = products.find(p => p.id == id);

  if (!product) {
    console.log("Producto no encontrado:", id);
    return;
  }
  
  if (product.stock <= 0) {
    showToast("Producto agotado");
    return;
  }

  let existing = cart.find(x => x.id == id);

  if (existing) {
    existing.cantidad += 1;
  } else {
    cart.push({
      id: product.id,
      nombre: product.name,
      precio: product.price,
      img: product.img,
      cantidad: 1
    });
  }

  localStorage.setItem("carrito", JSON.stringify(cart));
  updateCartCounter();
  showToast("Añadido al carrito");
}

// ============================================
// FAVORITOS
// ============================================
function updateFavCounter() {
  if (!favCount) return;
  let favs = JSON.parse(localStorage.getItem("favs")) || [];
  const total = favs.length;
  favCount.textContent = total;
  favCount.setAttribute("data-count", total);
  
  if (total > 0) {
    favCount.classList.remove("pulse");
    void favCount.offsetWidth;
    favCount.classList.add("pulse");
  }
}

function toggleFav(event, id) {
  event.preventDefault();
  event.stopPropagation();

  const btn = event.currentTarget;
  btn.classList.toggle('active');

  let favs = JSON.parse(localStorage.getItem("favs")) || [];
  const index = favs.findIndex(f => f.id === id);

  if (index === -1) {
    const productToAdd = products.find(p => p.id === id);
    if (productToAdd) {
      favs.push(productToAdd);
      showToast("Agregado a favoritos");
    }
  } else {
    favs.splice(index, 1);
    showToast("Quitado de favoritos");
  }

  localStorage.setItem("favs", JSON.stringify(favs));
  updateFavCounter();
}

// ============================================
// RENDER PRODUCTOS
// ============================================
// ============================================
// RENDER PRODUCTOS (con stock inteligente)
// ============================================
function renderProducts() {
  if (!productList) return;
  
  productList.innerHTML = "";
  let favs = JSON.parse(localStorage.getItem("favs")) || [];

  if (filtered.length === 0) {
    productList.innerHTML = "<h2 style='grid-column:1/-1; text-align:center;'>No se encontraron productos</h2>";
    return;
  }

  filtered.forEach(p => {
    const isFav = favs.some(f => f.id === p.id);
    
    // Determinar el texto de disponibilidad según el stock
    let stockText = "DISPONIBLE AHORA";
    if (p.stock <= 0) {
      stockText = "AGOTADO";
    } else if (p.stock <= 5) {
      stockText = " ÚLTIMAS PIEZAS ";
    }
    
    const productCard = document.createElement('div');
    productCard.className = 'product-card-luxe';
    productCard.innerHTML = `
      <button class="heart-fav ${isFav ? 'active' : ''}" onclick="toggleFav(event, ${p.id})">
        <img src="img/corazon.png" alt="Favorito" class="heart-icon">
      </button>
      <div class="product-clickable" onclick="openProductModal(${p.id})">
        <div class="img-container">
          <img src="${p.img}" alt="${p.name}" loading="lazy" onerror="this.src='img/logo.png'">
        </div>
        <div class="info-luxe">
          <h4>${p.name.toUpperCase()}</h4>
          <p class="subtitle-luxe" style="${p.stock <= 5 && p.stock > 0 ? 'color: #ff4d6d; font-weight: bold;' : ''}">${stockText}</p>
          <p class="price-luxe">$${p.price}</p>
        </div>
      </div>
      <button class="btn-buy-luxe" onclick="event.stopPropagation(); addToCart(${p.id})" ${p.stock <= 0 ? 'disabled style="opacity:0.5;"' : ''}>AGREGAR AL CARRITO</button>
    `;
    productList.appendChild(productCard);
  });
}

// ============================================
// FILTROS
// ============================================
function aplicarFiltrosCombinados() {
  filtered = products.filter(p => {
    const coincideMarca = (selectedBrand === "all" || p.brand && p.brand.toLowerCase() === selectedBrand.toLowerCase());
    const coincideCat = (selectedCategory === "all" || p.category === selectedCategory);
    return coincideMarca && coincideCat;
  });
  
  if (sortSelect && sortSelect.value !== "default") {
    const option = sortSelect.value;
    if (option === "az") {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (option === "za") {
      filtered.sort((a, b) => b.name.localeCompare(a.name));
    } else if (option === "precioAsc") {
      filtered.sort((a, b) => a.price - b.price);
    } else if (option === "precioDesc") {
      filtered.sort((a, b) => b.price - a.price);
    }
  }
  
  renderProducts();
}

function filterBrand(brand, element) {
  selectedBrand = brand;
  document.querySelectorAll('.brand-item-mini').forEach(item => item.classList.remove('selected'));
  if (element) element.classList.add('selected');
  aplicarFiltrosCombinados();
  
  setTimeout(() => {
    const categorySection = document.querySelector('.category-menu');
    if (categorySection) {
      const yOffset = -120;
      const y = categorySection.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }, 100);
}

function filterCategory(cat) {
  selectedCategory = cat;
  document.querySelectorAll(".category-menu button").forEach(btn => btn.classList.remove("active"));
  if (event && event.target) event.target.classList.add("active");
  aplicarFiltrosCombinados();
  
  setTimeout(() => {
    const categorySection = document.querySelector('.category-menu');
    if (categorySection) {
      const yOffset = -120;
      const y = categorySection.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }, 100);
}

function showOnlyFavs() {
  let favs = JSON.parse(localStorage.getItem("favs")) || [];
  if (favs.length === 0) {
    showToast("No tienes favoritos");
    return;
  }
  filtered = favs;
  renderProducts();
  showToast("Viendo tus favoritos");
}

// ============================================
// EXPERIENCIAS (LOOK MODAL)
// ============================================
function openExperience(tipo) {
  const modal = document.getElementById("lookModal");
  const container = document.getElementById("look-products");
  const modalContent = modal.querySelector(".look-modal-content");

  const selecciones = {
    'pro': [2, 3, 4, 8, 10],
    'kit': [1, 7, 5, 6],
    'skincare': [11, 12, 13]
  };

  const config = {
    'pro': { titulo: "FAVORITOS PRO", bgColor: "#fdf2f5", textColor: "#333", btn: "#ff4d6d" },
    'kit': { titulo: "KITS DE REGALO", bgColor: "#fff9fb", textColor: "#333", btn: "#ff4d6d" },
    'skincare': { titulo: "RITUAL SKINCARE", bgColor: "#f0f9f1", textColor: "#2d5a27", btn: "#4caf50" }
  };

  const IDsSeleccionados = selecciones[tipo];
  const experienceProducts = products.filter(p => IDsSeleccionados.includes(p.id));
  const setup = config[tipo];

  modalContent.style.backgroundColor = setup.bgColor;
  modalContent.style.color = setup.textColor;
  container.innerHTML = `<h2 style="text-align:center; margin-bottom:20px; width:100%; font-family:'Playfair Display';">${setup.titulo}</h2>`;

  let total = 0;
  experienceProducts.forEach((p, index) => {
    total += p.price;
    let pasoTag = (tipo === 'skincare') ? `<span style="display:inline-block; background:#2d5a27; color:white; width:24px; height:24px; border-radius:50%; line-height:24px; margin-right:8px;">${index + 1}</span>` : "";
    
    const productDiv = document.createElement('div');
    productDiv.style.cssText = "background:rgba(255,255,255,0.8); border-radius:15px; padding:15px; text-align:center;";
    productDiv.innerHTML = `
      ${pasoTag}
      <img src="${p.img}" alt="${p.name}" style="width:100%; height:120px; object-fit:contain;">
      <h4 style="margin:10px 0; font-size:14px;">${p.name}</h4>
      <p style="font-weight:bold; color:#ff4d6d;">$${p.price}</p>
      <button onclick="addToCart(${p.id})" style="cursor:pointer; padding:8px 15px; border-radius:5px; border:none; background:${setup.btn}; color:white;">Añadir</button>
    `;
    container.appendChild(productDiv);
  });

  const totalDiv = document.createElement('div');
  totalDiv.style.cssText = "width:100%; text-align:center; margin-top:20px; padding-top:20px; border-top:1px solid rgba(0,0,0,0.1);";
  totalDiv.innerHTML = `
    <h3>Total: $${total}</h3>
    <button class="btn-add-all-luxe" style="background:${setup.btn}; color:white; padding:15px 35px; border:none; border-radius:50px; cursor:pointer; font-weight:bold; width:100%;" onclick="completeExperience()">
      AÑADIR TODO AL CARRITO
    </button>
  `;
  container.appendChild(totalDiv);

  window.currentExperience = experienceProducts;
  modal.style.display = "flex";
}

function closeLook() {
  document.getElementById("lookModal").style.display = "none";
}

function completeExperience() {
  if (!window.currentExperience) return;
  window.currentExperience.forEach(p => addToCart(p.id));
  showToast("Selección añadida al carrito");
  closeLook();
}

// ============================================
// INICIALIZACIÓN
// ============================================
document.addEventListener("DOMContentLoaded", function () {
  cargarProductosDesdeAPI();
  
  if (search) {
    search.addEventListener("input", () => {
      let text = search.value.toLowerCase();
      filtered = products.filter(p => p.name.toLowerCase().includes(text));
      renderProducts();
      
      const productSection = document.getElementById("product-list");
      if (productSection && text.length > 0) {
        setTimeout(() => {
          const yOffset = -100;
          const y = productSection.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }, 100);
      }
    });
  }
  
  if (sortSelect) {
    sortSelect.addEventListener("change", () => {
      const option = sortSelect.value;
      if (option === "az") {
        filtered.sort((a, b) => a.name.localeCompare(b.name));
      } else if (option === "za") {
        filtered.sort((a, b) => b.name.localeCompare(a.name));
      } else if (option === "precioAsc") {
        filtered.sort((a, b) => a.price - b.price);
      } else if (option === "precioDesc") {
        filtered.sort((a, b) => b.price - a.price);
      }
      renderProducts();
    });
  }
  
  document.querySelectorAll('.brand-item-mini[data-brand]').forEach(item => {
    item.addEventListener('click', () => {
      const brand = item.getAttribute('data-brand');
      filterBrand(brand, item);
    });
  });
  
  document.querySelectorAll('.category-menu button[data-category]').forEach(btn => {
    btn.addEventListener('click', () => {
      const cat = btn.getAttribute('data-category');
      selectedCategory = cat;
      document.querySelectorAll(".category-menu button").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      aplicarFiltrosCombinados();
      
      setTimeout(() => {
        const categorySection = document.querySelector('.category-menu');
        if (categorySection) {
          const yOffset = -120;
          const y = categorySection.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 100);
    });
  });
  
  document.querySelectorAll('.btn-luxe[data-experience]').forEach(btn => {
    btn.addEventListener('click', () => {
      const exp = btn.getAttribute('data-experience');
      openExperience(exp);
    });
  });
  
  const footerTienda = document.getElementById('footer-tienda');
  if (footerTienda) {
    footerTienda.addEventListener('click', (e) => {
      e.preventDefault();
      selectedCategory = "all";
      selectedBrand = "all";
      aplicarFiltrosCombinados();
      document.querySelectorAll('.brand-item-mini').forEach(item => item.classList.remove('selected'));
      document.querySelector('.brand-item-mini.todo-btn').classList.add('selected');
      document.querySelectorAll(".category-menu button").forEach(btn => btn.classList.remove("active"));
      document.querySelector('.category-menu button[data-category="all"]').classList.add("active");
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
  
  const footerFavs = document.getElementById('footer-favs');
  if (footerFavs) {
    footerFavs.addEventListener('click', (e) => {
      e.preventDefault();
      showOnlyFavs();
    });
  }
  
  document.querySelectorAll('.footer-experience').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const exp = link.getAttribute('data-experience');
      openExperience(exp);
    });
  });
  
  const newsletterBtn = document.getElementById('newsletter-btn');
  const newsletterInput = document.getElementById('newsletter-email');
  if (newsletterBtn) {
    newsletterBtn.onclick = () => {
      const email = newsletterInput.value;
      if (email.includes('@')) {
        showToast("Bienvenida al Club Luxe");
        newsletterInput.value = "";
      } else {
        showToast("Por favor, ingresa un email válido");
      }
    };
  }
  
  document.querySelectorAll('.video-card').forEach(card => {
    const video = card.querySelector('video');
    const btn = card.querySelector('.btn-ver-producto');
    const productId = card.getAttribute('data-product-id');
    
    if (video) {
      card.addEventListener('mouseenter', () => video.play());
      card.addEventListener('mouseleave', () => {
        video.pause();
        video.currentTime = 0;
      });
    }
    
    if (btn && productId) {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        openProductModal(parseInt(productId));
      });
    }
    
    if (productId) {
      card.addEventListener('click', (e) => {
        if (e.target === btn || btn?.contains(e.target)) return;
        openProductModal(parseInt(productId));
      });
    }
  });
});

// ============================================
// CERRAR MODAL AL HACER CLIC FUERA
// ============================================
window.onclick = function(event) {
  const productModal = document.getElementById("productModal");
  const lookModal = document.getElementById("lookModal");
  
  if (event.target == productModal) {
    closeProductModal();
  }
  if (event.target == lookModal) {
    closeLook();
  }
}

document.addEventListener('keydown', function(event) {
  if (event.key === "Escape") {
    const productModal = document.getElementById("productModal");
    if (productModal.style.display === "flex") {
      closeProductModal();
    }
  }
});

// ============================================
// MENÚ HAMBURGUESA
// ============================================
function toggleMenu() {
  const menu = document.getElementById('side-menu');
  menu.classList.toggle('active');
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
// SLIDER AUTOMÁTICO
// ============================================
let slideIndex = 0;

function showSlide(n) {
  const slides = document.getElementsByClassName("slide");
  if (slides.length === 0) return;
  
  if (n >= slides.length) slideIndex = 0;
  if (n < 0) slideIndex = slides.length - 1;
  
  for (let i = 0; i < slides.length; i++) {
    slides[i].classList.remove("active");
  }
  
  slides[slideIndex].classList.add("active");
}

function nextSlide() {
  slideIndex++;
  showSlide(slideIndex);
}

function prevSlide() {
  slideIndex--;
  showSlide(slideIndex);
}

setInterval(() => {
  nextSlide();
}, 5000);