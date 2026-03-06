let products = [
{ id: 1, name: "Labial Humectante", price: 65, category: "labial", brand: "bissu", img: "img/labial.png", desc: "Labial clásico de Bissú con aceite de coco." },
  { id: 2, name: "Ultimate Shadow Palette", price: 420, category: "sombra", brand: "nyx", img: "img/paletas.png", desc: "Paleta profesional con 16 tonos de alta pigmentación." },
  { id: 3, name: "Can't Stop Won't Stop Foundation", price: 380, category: "base", brand: "nyx", img: "img/base.png", desc: "Base de maquillaje líquida de cobertura total y mate." },
  { id: 4, name: "HD Photogenic Concealer", price: 160, category: "corrector", brand: "nyx", img: "img/corrector.png", desc: "Corrector que ayuda a cubrir imperfecciones y ojeras." },
  { id: 5, name: "Plumin Delineador Mate", price: 95, category: "ojos", brand: "bissu", img: "img/delineador.png", desc: "Delineador de ojos tipo plumín resistente al agua." },
  { id: 6, name: "Lash Sensational Sky High", price: 285, category: "ojos", brand: "maybelline", img: "img/rimel.png", desc: "Máscara que ofrece longitud sin límites y volumen." },
  { id: 7, name: "Gloss Labial", price: 85, category: "labial", brand: "bissu", img: "img/labial2.png", desc: "Brillo con destellos brillantes y textura no pegajosa." },
  { id: 8, name: "Set de Brochas Esenciales", price: 450, category: "accesorios", brand: "luxe", img: "img/brochas.png", desc: "Set profesional de cerdas sintéticas premium." },
  { id: 9, name: "Iluminador en Polvo", price: 98, category: "iluminador", brand: "bissu", img: "img/iluminador.png", desc: "Polvo compacto para dar luz al rostro." },
  { id: 10, name: "Rubor Compacto", price: 72, category: "rubor", brand: "bissu", img: "img/rubor.png", desc: "Textura sedosa para un acabado natural." },

  // --- SKINCARE (PARA TUS EXPERIENCIAS) ---
  { id: 11, name: "Revitalift Limpiador", price: 195, category: "skincare", brand: "loreal", img: "img/limpiador.png", desc: "Gel de limpieza facial con ácido hialurónico." },
  { id: 12, name: "Sérum Pure Vitamin C10", price: 850, category: "skincare", brand: "loreal", img: "img/serum.png", desc: "Sérum renovador antioxidante para dar luminosidad." },
  { id: 13, name: "Hydra Touch Primer", price: 340, category: "skincare", brand: "nyx", img: "img/crema.png", desc: "Base de maquillaje hidratante con extractos de plantas." },

  // --- NUEVOS: ROSTRO (BASES Y CORRECTORES) ---
  { id: 14, name: "Pro Filt'r Soft Matte", price: 790, category: "base", brand: "fenty", img: "img/fenty-base.png", desc: "Base de larga duración en 50 tonos." },
  { id: 15, name: "Studio Fix Fluid SPF 15", price: 760, category: "base", brand: "mac", img: "img/mac-base.png", desc: "Base con control de aceite y acabado mate natural." },
  { id: 16, name: "Dior Backstage Face & Body", price: 980, category: "base", brand: "dior", img: "img/dior-base.png", desc: "La base secreta de los maquilladores de Dior." },
  { id: 17, name: "Fit Me Matte + Poreless", price: 215, category: "base", brand: "maybelline", img: "img/fit-me.png", desc: "Matifica la piel y desvanece los poros." },
  { id: 18, name: "Infallible Fresh Wear 24H", price: 310, category: "base", brand: "loreal", img: "img/infallible.png", desc: "Cobertura completa que permite que la piel respire." },
  { id: 19, name: "Liquid Touch Concealer", price: 520, category: "corrector", brand: "rare", img: "img/rare-concealer.png", desc: "Corrector hidratante de cobertura media a total." },
  { id: 20, name: "Corrector de Larga Duración", price: 110, category: "corrector", brand: "bissu", img: "img/corrector-bissu.png", desc: "Corrector líquido cremoso de alta cobertura." },

  // --- NUEVOS: LABIOS ---
  { id: 21, name: "SuperStay Matte Ink", price: 260, category: "labial", brand: "maybelline", img: "img/matte-ink.png", desc: "Tinta de labios líquida con hasta 16 horas de duración." },
  { id: 22, name: "Matte Lipstick Ruby Woo", price: 460, category: "labial", brand: "mac", img: "img/mac-red.png", desc: "El rojo más famoso del mundo con acabado ultra mate." },
  { id: 23, name: "Soft Pinch Liquid Blush", price: 540, category: "rubor", brand: "rare", img: "img/rare-blush.png", desc: "Rubor líquido de larga duración que se difumina hermoso." },
  { id: 24, name: "Gloss Bomb Universal", price: 490, category: "labial", brand: "fenty", img: "img/fenty-gloss.png", desc: "Brillo de labios irresistible con aroma a melocotón y vainilla." },
  { id: 25, name: "Lip Glow Oil", price: 890, category: "labial", brand: "dior", img: "img/dior-oil.png", desc: "Aceite labial brillante que protege y realza." },
  { id: 26, name: "Fat Oil Lip Drip", price: 220, category: "labial", brand: "nyx", img: "img/fat-oil.png", desc: "Aceite hidratante con color de gran brillo." },

  // --- NUEVOS: OJOS ---
  { id: 27, name: "Paleta de Sombras 'Mi Tierra'", price: 115, category: "sombra", brand: "bissu", img: "img/mitierra.png", desc: "Quintetos de sombras con colores intensos." },
  { id: 28, name: "Mascara Lash Paradise", price: 275, category: "ojos", brand: "loreal", img: "img/paradise.png", desc: "Volumen y longitud instantáneos con cepillo suave." },
  { id: 29, name: "Epic Ink Liner Black", price: 255, category: "ojos", brand: "nyx", img: "img/epic-ink.png", desc: "Delineador líquido con punta de pincel precisa." },
  { id: 30, name: "Perfect Strokes Eye Liner", price: 480, category: "ojos", brand: "rare", img: "img/rare-liner.png", desc: "Delineador líquido mate con flujo continuo." },
  { id: 31, name: "Delineador en Gel para Cejas", price: 85, category: "ojos", brand: "bissu", img: "img/cejas-bissu.png", desc: "Define y rellena tus cejas con acabado natural." },
  { id: 32, name: "Brow Fast Sculpt", price: 195, category: "ojos", brand: "maybelline", img: "img/brow-mascara.png", desc: "Máscara de cejas con color para peinar y fijar." },

  // --- NUEVOS: RUBORES, ILUMINADORES Y POLVOS ---
  { id: 33, name: "Mineralize Skinfinish", price: 810, category: "iluminador", brand: "mac", img: "img/mac-high.png", desc: "Polvo facial de lujo cocido a fuego lento." },
  { id: 34, name: "Killawatt Highlighter Duo", price: 820, category: "iluminador", brand: "fenty", img: "img/fenty-high.png", desc: "Dos tonos de iluminador para un brillo personalizado." },
  { id: 35, name: "Polvo Traslúcido Suelto", price: 95, category: "rubor", brand: "bissu", img: "img/polvo.png", desc: "Polvo fino para sellar el maquillaje y eliminar brillo." },
  { id: 36, name: "Rouge Blush", price: 1100, category: "rubor", brand: "dior", img: "img/dior-blush.png", desc: "Rubor de larga duración con pigmentos intensos." },
  { id: 37, name: "Stay Vulnerable Blush", price: 510, category: "rubor", brand: "rare", img: "img/rare-creamblush.png", desc: "Rubor en crema resistente al agua que se funde en la piel." },

  // --- NUEVOS: EXTRAS Y ACCESORIOS ---
  { id: 38, name: "Agua Micelar Todo en 1", price: 145, category: "skincare", brand: "loreal", img: "img/micelar.png", desc: "Limpia, desmaquilla y tonifica el rostro." },
  { id: 39, name: "Fat Water Toner Serum", price: 720, category: "skincare", brand: "fenty", img: "img/fat-water.png", desc: "Tratamiento que reduce poros y manchas." },
  { id: 40, name: "Dior Addict Lip Maximizer", price: 910, category: "labial", brand: "dior", img: "img/maximizer.png", desc: "Brillo de labios con efecto volumen instantáneo." },
  { id: 41, name: "Esponja Beauty Blender", price: 180, category: "accesorios", brand: "luxe", img: "img/esponja.png", desc: "Esponja para difuminar base y corrector." },
  { id: 42, name: "Brush Cleanser", price: 390, category: "accesorios", brand: "mac", img: "img/cleaner.png", desc: "Limpiador de brochas de secado rápido." },
  { id: 43, name: "Prep + Prime Fix+", price: 680, category: "accesorios", brand: "mac", img: "img/fix.png", desc: "Bruma de agua que fija el maquillaje y refresca." },
  { id: 44, name: "Matte Setting Spray", price: 235, category: "accesorios", brand: "nyx", img: "img/set-spray.png", desc: "Fijador de maquillaje para evitar el brillo." },
  { id: 45, name: "Sacapuntas de Cosméticos", price: 1, category: "accesorios", brand: "bissu", img: "img/sacapuntas.png", desc: "Mantén tus lápices con punta perfecta." },
  { id: 46, name: "Pegamento Lash It Loud", price: 190, category: "accesorios", brand: "nyx", img: "img/glue.png", desc: "Adhesivo para pestañas de alta fijación." },
  { id: 47, name: "Pestañas Postizas 3D", price: 85, category: "ojos", brand: "bissu", img: "img/pestañas.png", desc: "Añade volumen y drama a tus ojos." },
  { id: 48, name: "Paleta Pro Contour", price: 320, category: "rubor", brand: "nyx", img: "img/contour.png", desc: "Kit para definir y resaltar facciones." },
  { id: 49, name: "Delineador de Labios Retráctil", price: 55, category: "labial", brand: "bissu", img: "img/lip-liner.png", desc: "Textura cremosa para delinear labios." },
  { id: 50, name: "Espejo de Bolsillo Luxe", price: 120, category: "accesorios", brand: "luxe", img: "img/espejo.png", desc: "Espejo con aumento para retoques rápidos." }
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
function renderProducts() {
  productList.innerHTML = "";
  let favs = JSON.parse(localStorage.getItem("favs")) || [];

  if (filtered.length === 0) {
    productList.innerHTML = "<h2>No se encontraron productos </h2>";
    return;
  }

  filtered.forEach(p => {
    const isFav = favs.some(f => f.id === p.id);

    productList.innerHTML += `
      <div class="product-card-luxe">
        
       <button class="heart-fav ${isFav ? 'active' : ''}" onclick="toggleFav(event, ${p.id})">
          ❤
        </button>

        <a href="producto.html?id=${p.id}" class="product-link">
          <div class="img-container">
            <img src="${p.img}" alt="${p.name}">
          </div>
          <div class="info-luxe">
            <h4>${p.name.toUpperCase()}</h4>
            <p class="subtitle-luxe">DISPONIBLE AHORA</p>
            <p class="price-luxe">$${p.price}</p>
          </div>
        </a>

        <button class="btn-buy-luxe" onclick="addToCart(${p.id})">
          Agregar al carrito
        </button>
      </div>
    `;
});
}
/*favoritos*/
function toggleFav(event, id) {
    event.preventDefault();
    event.stopPropagation();

    const btn = event.currentTarget; 

    // 1. CAMBIO VISUAL INMEDIATO
    btn.classList.toggle('active');

    // 2. LÓGICA DE DATOS
    let favs = JSON.parse(localStorage.getItem("favs")) || [];
    const index = favs.findIndex(f => f.id === id);

    if (index === -1) {
        // AGREGAR
        const productToAdd = products.find(p => p.id === id);
        if (productToAdd) {
            favs.push(productToAdd);
            // --- AQUÍ VOLVEMOS A AVISAR ---
            showToast("Agregado a favoritos ");
        }
    } else {
        // ELIMINAR
        favs.splice(index, 1);
        // --- AVISO DE ELIMINADO ---
        showToast("Quitado de favoritos ");
    }

    // 3. GUARDAR
    localStorage.setItem("favs", JSON.stringify(favs));

    // 4. ACTUALIZAR EL CONTADOR DEL HEADER (Importante para que se vea arriba)
    updateFavCounter();
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
        titulo: "FAVORITOS PRO ", 
        bgColor: "#fdf2f5", 
        textColor: "#333333", 
        btn: "#ff4d6d" 
    },
    'kit': { 
        titulo: "KITS DE REGALO ", 
        bgColor: "#fff9fb", 
        textColor: "#333333", 
        btn: "#ff4d6d" 
    },
    'skincare': { 
        titulo: "RITUAL SKINCARE ", 
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
         AÑADIR TODO AL CARRITO
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
    alert("¡Selección añadida al carrito! ");
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
  showToast("¡Añadido al carrito! ");
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
    showToast("Ya está en favoritos ");
    return;
  }

  favs.push(product);
  localStorage.setItem("favs", JSON.stringify(favs));

  showToast("Agregado a favoritos ");
  updateFavCounter(); // Identificador: Llamada a animación
}
let selectedBrand = "all";
let selectedCategory = "all";

function filterBrand(brand, element) {
    selectedBrand = brand;

    // Quitar la clase 'selected' de todos los logos y ponerla al que clicamos
    document.querySelectorAll('.brand-item-mini').forEach(item => item.classList.remove('selected'));
    if (element) {
        element.classList.add('selected');
    }

    aplicarFiltrosCombinados();
}

/* BUSCADOR, FILTROS Y ORDEN*/

function filterCategory(cat) {
    selectedCategory = cat;

    // Manejo visual de botones de categoría
    document.querySelectorAll(".category-menu button").forEach(btn => btn.classList.remove("active"));
    if (event && event.target) {
        event.target.classList.add("active");
    }

    aplicarFiltrosCombinados();
}
function aplicarFiltrosCombinados() {
    filtered = products.filter(p => {
        const coincideMarca = (selectedBrand === "all" || p.brand.toLowerCase() === selectedBrand.toLowerCase());
        const coincideCat = (selectedCategory === "all" || p.category === selectedCategory);
        return coincideMarca && coincideCat;
    });

    renderProducts();
}

function showOnlyFavs() {
  let favs = JSON.parse(localStorage.getItem("favs")) || [];
  
  if (favs.length === 0) {
    showToast("No tienes favoritos ");
    return;
  }
  filtered = favs;
  renderProducts();
  showToast("Viendo tus favoritos ");
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
                showToast("¡Bienvenida al Club Luxe! ");
                newsletterInput.value = "";
            } else {
                showToast("Por favor, ingresa un email válido ");
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
