// 1. Validar Seguridad y Roles al entrar
const userSession = JSON.parse(localStorage.getItem("usuarioActual"));

// Si no hay sesión o el usuario es un "cliente", lo mandamos fuera
if (!userSession || userSession.rol === "cliente") {
    alert("Acceso restringido solo para personal autorizado ⛔");
    window.location.href = "login.html";
}

// 2. Personalizar la interfaz según el Rol
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("nombre-usuario").innerText = userSession.nombre;
    const badge = document.getElementById("rol-usuario");
    badge.innerText = userSession.rol.toUpperCase();
    badge.classList.add(userSession.rol === "admin" ? "badge-admin" : "badge-empleado");

    // Si es ADMIN, mostramos el botón de agregar
    if (userSession.rol === "admin") {
        document.getElementById("btn-agregar").classList.remove("hidden");
    }

   cargarProductos();
    crearGrafica();
    actualizarResumen();
});

// Simulación de datos para la gráfica
function crearGrafica() {
    const ctx = document.getElementById('graficaVentas').getContext('2d');
    new Chart(ctx, {
        type: 'line', // Gráfica de línea
        data: {
            labels: ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'],
            datasets: [{
                label: 'Ventas de la semana ($)',
                data: [1200, 1900, 1500, 2500, 2200, 3000, 2800],
                borderColor: '#ff4d6d',
                backgroundColor: 'rgba(255, 77, 109, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } }
        }
    });
}

function actualizarResumen() {
    // Aquí podrías sumar datos reales, por ahora simulamos:
    document.getElementById("total-ventas").innerText = "$15,100.00";
    document.getElementById("cantidad-vendida").innerText = "45";
}

// 3. Cargar productos desde tu JSON
async function cargarProductos() {
    try {
        const res = await fetch("data/productos.json");
        const productos = await res.json();
        const tabla = document.getElementById("lista-inventario");
        tabla.innerHTML = "";

        productos.forEach(p => {
            const tr = document.createElement("tr");
            let btns = userSession.rol === "admin" 
                ? `<button class="btn-accion btn-editar">✏️</button><button class="btn-accion btn-borrar">🗑️</button>` 
                : `<span>Lectura</span>`;

            tr.innerHTML = `
                <td><img src="${p.img}" width="40"></td>
                <td><b>${p.name}</b></td>
                <td>$${p.price}</td>
                <td>${btns}</td>
            `;
            tabla.appendChild(tr);
        });
    } catch (e) { console.log(e); }
}

document.getElementById("btn-cerrar-sesion").onclick = () => {
    localStorage.removeItem("usuarioActual");
    window.location.href = "login.html";
};
// 4. Funciones de botones (para que el profe vea que funcionan los eventos)
function eliminar(id) {
    if(confirm("¿Estás seguro de eliminar este producto del stock?")) {
        alert("Producto " + id + " eliminado (Simulación)");
        // Aquí es donde en el futuro conectarías con Visual Basic para borrar en SQL
    }
}

function editar(id) {
    alert("Abriendo editor para el producto " + id);
}

// Cerrar Sesión
document.getElementById("btn-cerrar-sesion").onclick = () => {
    localStorage.removeItem("usuarioActual");
    window.location.href = "login.html";
};