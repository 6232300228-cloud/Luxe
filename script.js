let products = [
  { id:1, name:"Labial Cremoso Soft Matte", price:250, category:"labial", img:"img/labial.png", desc:"Labial suave, matte y de larga duración." },
  { id:2, name:"Ultimate Shadow Palette", price:400, category:"sombra", img:"img/paletas.png", desc:"Paleta profesional con tonos increíbles." },
  { id:3, name:"Can't Stop Foundation", price:350, category:"base", img:"img/base.png", desc:"Base resistente todo el día." },
  { id:4, name:"HD Photogenic Concealer", price:280, category:"corrector", img:"img/corrector.png", desc:"Corrector de alta cobertura y acabado natural." },
  { id:5, name:"Delineador negro waterproof", price:95, category:"ojos", img:"img/delineador.png", desc:"Delineador de alta duración." },
  { id:6, name:"Mascara Lash Sensational", price:180, category:"ojos", img:"img/rimel.png", desc:"Volumen definido." },
  { id:7, name:"Labial Glossy Rosa", price:120, category:"labial", img:"img/labial2.png", desc:"Brillo labial hidratante." },
  { id:8, name:"Set de Brochas Luxe", price:350, category:"accesorios", img:"img/brochas.png", desc:"Set profesional." },
  { id:9, name:"Iluminador Perla Glow", price:210, category:"iluminador", img:"img/iluminador.png", desc:"Brillo natural elegante." },
  { id: 10, name: "Rubor Silk Glow ", price: 225, category: "rubor", img: "img/rubor.png", desc: "Acabado luminoso y textura sedosa marmoleada." },
  { id: 11, name: "Limpiador Hidratante Pure", price: 320, category: "skincare", img: "img/limpiador.png", desc: "Paso 1: Limpia profundamente sin resecar." },
  { id: 12, name: "Sérum Vitamina C Glow", price: 450, category: "skincare", img: "img/serum.png", desc: "Paso 2: Luminosidad instantánea pre-maquillaje." },
  { id: 13, name: "Crema Hydro-Primer", price: 380, category: "skincare", img: "img/crema.png", desc: "Paso 3: Hidratación intensa y base para el maquillaje." }
];

let filtered = products;

document.addEventListener("DOMContentLoaded", function () {
  renderProducts();
  renderBestSellers();
});


const productList = document.getElementById("product-list");
const cartCount = document.getElementById("cart-count");
const favCount = document.getElementById("fav-count");


if (search) {
  search.addEventListener("input", () => {
    let text = search.value.toLowerCase();
    filtered = products.filter(p => p.name.toLowerCase().includes(text));
    renderProducts();
  });
}
/*ordenarpor*/
const sortSelect = document.getElementById("sort");

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

/*header*/ 
function toggleMenu() {
  const menu = document.getElementById('side-menu');
  const overlay = document.getElementById('overlay');
  
  menu.classList.toggle('active');
  overlay.classList.toggle('active');
}
/*notificacion toast*/
function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2000);
}

/* CARGAR PRODUCTOS*/

function renderBestSellers() {
  const bestContainer = document.getElementById("best-products");
  if (!bestContainer) return;

  const best = [...products].sort((a,b) => b.price - a.price).slice(0,3);

  best.forEach(p => {
    bestContainer.innerHTML += `
      <div class="card badge-best">
        <span class="badge">Más Vendido</span>
        <img src="${p.img}">
        <h4>${p.name}</h4>
        <p>$${p.price}</p>
        <button onclick="openQuickView(${p.id})">Vista rápida</button>
      </div>
    `;
  });
}


/* MOSTRAR PRODUCTOS*/

function renderProducts() {
  
  productList.innerHTML = "";

  if (filtered.length === 0) {
    productList.innerHTML = "<h2>No se encontraron productos 😥</h2>";
    return;
  }

  filtered.forEach(p => {
    productList.innerHTML += `
      <div class="card">
        <a href="producto.html?id=${p.id}">
          <img src="${p.img}">
          <h4>${p.name}</h4>
        </a>
        <p>$${p.price}</p>
        <button onclick="addToCart(${p.id})">Agregar 🛒</button>
        <button onclick="addToFav(${p.id})">❤️ Favorito</button>
      </div>
    `;
  });
}
/*probado*/
document.querySelectorAll('.video-card').forEach(card => {
  const video = card.querySelector('video');

  card.addEventListener('mouseenter', () => {
    video.play();
  });

  card.addEventListener('mouseleave', () => {
    video.pause();
    video.currentTime = 0;
  });
});
/*look*/ 
function openExperience(tipo) {
  const modal = document.getElementById("lookModal");
  const container = document.getElementById("look-products");
  const modalContent = modal.querySelector(".look-modal-content");

  //  IDs van en cada banner
  const selecciones = {
    'pro': [2, 3, 4, 8, 10],      
    'kit': [1, 7, 5, 6],        
    'skincare': [11, 12, 13]        
  };

  // Filtro productos usando IDs
  const IDsSeleccionados = selecciones[tipo];
  const experienceProducts = products.filter(p => IDsSeleccionados.includes(p.id));

  container.innerHTML = "";
  let total = 0;

  // Configuración de Estilos
  const config = {
    'pro': { 
        titulo: "FAVORITOS PRO 💜", 
        bgColor: "#fdf2f5", 
        textColor: "#333333", 
        btn: "#ff4d6d" 
    },
    'kit': { 
        titulo: "KITS DE REGALO 🎁", 
        bgColor: "#fff9fb", 
        textColor: "#333333", 
        btn: "#ff4d6d" 
    },
    'skincare': { 
        titulo: "RITUAL SKINCARE ✨", 
        bgColor: "#f0f9f1", 
        textColor: "#2d5a27", 
        btn: "#4caf50" 
    }
  };

  const setup = config[tipo];
  modalContent.style.backgroundColor = setup.bgColor;
  modalContent.style.color = setup.textColor;

  container.innerHTML = `<h2 style="text-align:center; margin-bottom:20px; width:100%; font-family:'Playfair Display', serif;">${setup.titulo}</h2>`;

  experienceProducts.forEach((p, index) => {
    total += p.price;
    let pasoTag = (tipo === 'skincare') ? `<span class="step-badge">Paso ${index + 1}</span>` : "";

    container.innerHTML += `
      <div class="card-luxe" style="background: rgba(128,128,128,0.1); border-radius:15px; padding:15px; position:relative; text-align:center;">
        ${pasoTag}
        <img src="${p.img}" alt="${p.name}" style="width:100%; height:120px; object-fit:contain;">
        <h4 style="margin:10px 0; font-size:14px;">${p.name}</h4>
        <p style="font-weight:bold; color:#ff4d6d;">$${p.price}</p>
        <button onclick="addToCart(${p.id})" style="cursor:pointer; padding:8px 15px; border-radius:5px; border:none; background:${setup.btn}; color:white;">Añadir</button>
      </div>
    `;
  });

  container.innerHTML += `
    <div class="look-total" style="width:100%; text-align:center; margin-top:20px; padding-top:20px; border-top:1px solid rgba(128,128,128,0.3);">
      <h3>Total de la Experiencia: $${total}</h3>
      <button class="btn-add-all-luxe" 
              style="background:${setup.btn}; color:white; padding:15px 35px; border:none; border-radius:50px; cursor:pointer; font-weight:bold; width:100%;" 
              onclick="completeExperience()">
        🛒 AÑADIR TODO AL CARRITO
      </button>
    </div>
  `;

  window.currentExperience = experienceProducts;
  modal.style.display = "flex";
}

// Función para cerrar (clic fuera)
window.onclick = function(event) {
    const modal = document.getElementById("lookModal");
    if (event.target == modal) {
        closeLook();
    }
}

function closeLook() {
    document.getElementById("lookModal").style.display = "none";
}

function completeExperience() {
    if (!window.currentExperience) return;
    window.currentExperience.forEach(p => addToCart(p.id));
    // Si tienes showToast úsalo, si no, un alert:
    alert("¡Selección añadida al carrito! 💄✨");
    closeLook();
}
/* CARRITO (CON ANIMACIÓN)*/

function updateCartCounter() {
  let cart = JSON.parse(localStorage.getItem("carrito")) || [];
  
  // Identificador: Lógica de pulso y visibilidad
  if (cartCount) {
    const total = cart.length;
    cartCount.setAttribute("data-count", total);

    if (total > 0) {
      cartCount.innerText = total;
      // Disparar pulso
      cartCount.classList.remove("pulse");
      void cartCount.offsetWidth; 
      cartCount.classList.add("pulse");
    } else {
      cartCount.innerText = "";
    }
  }
}

function addToCart(id) {
  let cart = JSON.parse(localStorage.getItem("carrito")) || [];
  let product = products.find(p => p.id == id);

  if (!product) {
    console.log("Producto no encontrado:", id);
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
}


/* FAVORITOS (CON ANIMACIÓN)*/

function updateFavCounter() {
  let favs = JSON.parse(localStorage.getItem("favs")) || [];
  
  if (favCount) {
    const total = favs.length;
    favCount.setAttribute("data-count", total);

    if (total > 0) {
      favCount.innerText = total;
      // Pulso para favoritos también
      favCount.classList.remove("pulse");
      void favCount.offsetWidth;
      favCount.classList.add("pulse");
    } else {
      favCount.innerText = "";
    }
  }
}

function addToFav(id) {
  let favs = JSON.parse(localStorage.getItem("favs")) || [];
  let product = products.find(p => p.id === id);
  let exists = favs.find(x => x.id === id);

  if (exists) {
    showToast("Ya está en favoritos ❤️");
    return;
  }

  favs.push(product);
  localStorage.setItem("favs", JSON.stringify(favs));

  showToast("Agregado a favoritos ✨");
  updateFavCounter(); // Identificador: Llamada a animación
}

/* BUSCADOR, FILTROS Y ORDEN*/

function filterCategory(cat) {
  filtered = cat === "all"
    ? products
    : products.filter(p => p.category === cat);

  renderProducts();

  document.querySelectorAll(".category-menu button")
    .forEach(btn => btn.classList.remove("active"));

  event.target.classList.add("active");

};

function showOnlyFavs() {
  let favs = JSON.parse(localStorage.getItem("favs")) || [];
  
  if (favs.length === 0) {
    showToast("No tienes favoritos 💔");
    return;
  }

  renderProducts();
}
/* LÓGICA DEL FOOTER*/

// Funcionalidad para el Formulario de Suscripción
document.addEventListener('DOMContentLoaded', () => {
    const newsletterBtn = document.querySelector('.newsletter-form button');
    const newsletterInput = document.querySelector('.newsletter-form input');

    if (newsletterBtn) {
        newsletterBtn.onclick = () => {
            const email = newsletterInput.value;
            if (email.includes('@')) {
                showToast("¡Bienvenida al Club Luxe! 💌");
                newsletterInput.value = "";
            } else {
                showToast("Por favor, ingresa un email válido ❌");
            }
        };
    }
});

// Hacer que los enlaces de "Explorar" del footer funcionen
//   función para navegar y filtrar desde el footer
function navigateAndFilter(category) {
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
    
    if (category === 'all') {
        filterCategory('all');
    } else if (category === 'favs') {
        showOnlyFavs();
    } else {
        filterCategory(category);
    }
}
/*INICIO*/

updateCartCounter();
updateFavCounter();
