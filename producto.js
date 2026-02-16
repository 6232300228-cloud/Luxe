const detail = document.getElementById("product-detail");

// Identificador: Contador Carrito
function actualizarContadorCarrito() {
  const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  const contador = document.getElementById("cart-count");

  if (contador) {
    const total = carrito.length;
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

// Identificador: Toast
function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2000);
}

// Identificador: Cargar datos URL
const params = new URLSearchParams(window.location.search);
const id = parseInt(params.get("id"));

// Identificador: Render Producto
async function loadProduct() {
  const res = await fetch("data/productos.json");
  const products = await res.json();
  const product = products.find(p => p.id == id);

  detail.innerHTML = `
    <div class="detail-card">
      <div>
        <img src="${product.img}" class="detail-img">
      </div>
      <div>
        <h2>${product.name}</h2>
        <p><strong>Precio:</strong> $${product.price}</p>
        <p class="desc">
          Producto de alta calidad, ideal para tu rutina de maquillaje 💖
        </p>
        <button onclick="addToCart(${product.id}, '${product.name}', '${product.img}', ${product.price})" class="btn-pagar">
          Agregar al carrito 🛒
        </button>
      </div>
    </div>
  `;
}

// Identificador: Logica Agregar
window.addToCart = function(id, name, img, price) {
  let cart = JSON.parse(localStorage.getItem("carrito")) || [];
  let existing = cart.find(x => x.id == id);

  if (existing) {
    existing.cantidad += 1;
  } else {
    cart.push({ id, name, img, price, cantidad: 1 });
  }

  localStorage.setItem("carrito", JSON.stringify(cart));
  
  // Aquí se agrga
  showToast("Producto agregado 🛒");
  actualizarContadorCarrito(); 
};

// Carga inicial
loadProduct();
actualizarContadorCarrito();