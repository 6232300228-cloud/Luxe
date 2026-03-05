// ============================================
// 1. VALIDAR USUARIO Y ROL (CON LAS VARIABLES CORRECTAS)
// ============================================
const user = JSON.parse(localStorage.getItem("user"));
const token = localStorage.getItem("token");

// Verificar si hay sesión y rol válido
if (!user || !token || (user.role !== "admin" && user.role !== "empleado")) {
    alert("⛔ Acceso restringido solo para personal autorizado");
    window.location.href = "login.html";
}

// ============================================
// 2. CONFIGURACIÓN INICIAL
// ============================================
document.addEventListener("DOMContentLoaded", async () => {
    // Mostrar información del usuario
    document.getElementById("nombre-usuario").innerText = user.nombre;
    const badge = document.getElementById("rol-usuario");
    badge.innerText = user.role.toUpperCase();
    badge.classList.add(user.role === "admin" ? "badge-admin" : "badge-empleado");

    // Mostrar botón de agregar solo para admin
    if (user.role === "admin") {
        document.getElementById("btn-agregar").classList.remove("hidden");
    }

    // Cargar datos reales desde MongoDB
    await cargarProductos();
    await cargarEstadisticas();
    crearGrafica();
});

// ============================================
// 3. CARGAR PRODUCTOS DESDE MONGODB
// ============================================
async function cargarProductos() {
    try {
        const response = await fetch('http://localhost:3000/api/products');
        const productos = await response.json();
        
        const tabla = document.getElementById("lista-inventario");
        tabla.innerHTML = "";

        productos.forEach(p => {
            const tr = document.createElement("tr");
            
            // Color según stock
            const stockColor = p.stock <= 0 ? '#f44336' : (p.stock <= 20 ? '#ff9800' : '#4CAF50');
            
            let btns = '';
            if (user.role === "admin") {
                btns = `
                    <button class="btn-accion btn-editar" onclick="editarProducto('${p._id}')">✏️</button>
                    <button class="btn-accion btn-borrar" onclick="eliminarProducto('${p._id}')">🗑️</button>
                `;
            } else {
                btns = `<span style="color: #888;">👁️ Solo lectura</span>`;
            }

            tr.innerHTML = `
                <td><img src="${p.img}" width="40" style="border-radius: 5px;"></td>
                <td><b>${p.name}</b><br><small style="color: #888;">ID: ${p.id}</small></td>
                <td>${p.category || 'Sin categoría'}</td>
                <td style="font-weight: bold; color: #ff4d6d;">$${p.price}</td>
                <td style="color: ${stockColor}; font-weight: bold;">${p.stock} unidades</td>
                <td>${btns}</td>
            `;
            tabla.appendChild(tr);
        });
        
    } catch (error) {
        console.error('❌ Error cargando productos:', error);
    }
}

// ============================================
// 4. CARGAR ESTADÍSTICAS REALES
// ============================================
async function cargarEstadisticas() {
    try {
        // Obtener pedidos
        const response = await fetch('http://localhost:3000/api/orders/mis-pedidos', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) {
            throw new Error('Error obteniendo pedidos');
        }
        
        const pedidos = await response.json();
        
        // Calcular ventas del mes
        const ventasMes = pedidos
            .filter(p => {
                const fechaPedido = new Date(p.fechaPedido);
                const hoy = new Date();
                return fechaPedido.getMonth() === hoy.getMonth() 
                    && fechaPedido.getFullYear() === hoy.getFullYear();
            })
            .reduce((sum, p) => sum + p.total, 0);
        
        // Calcular productos vendidos
        const productosVendidos = pedidos
            .flatMap(p => p.productos)
            .reduce((sum, prod) => sum + prod.cantidad, 0);
        
        document.getElementById("total-ventas").innerText = `$${ventasMes.toFixed(2)}`;
        document.getElementById("cantidad-vendida").innerText = productosVendidos;
        
    } catch (error) {
        console.error('Error cargando estadísticas:', error);
        document.getElementById("total-ventas").innerText = "$0.00";
        document.getElementById("cantidad-vendida").innerText = "0";
    }
}

// ============================================
// 5. CREAR GRÁFICA DE VENTAS
// ============================================
async function crearGrafica() {
    try {
        const response = await fetch('http://localhost:3000/api/orders/mis-pedidos', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const pedidos = await response.json();
        
        // Organizar ventas por día de la semana
        const ventasPorDia = [0, 0, 0, 0, 0, 0, 0];
        
        pedidos.forEach(p => {
            const fecha = new Date(p.fechaPedido);
            const dia = fecha.getDay();
            ventasPorDia[dia] += p.total;
        });

        const ctx = document.getElementById('graficaVentas').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
                datasets: [{
                    label: 'Ventas de la semana ($)',
                    data: ventasPorDia,
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
    } catch (error) {
        console.error('Error creando gráfica:', error);
    }
}

// ============================================
// 6. FUNCIONES DE ADMIN (editar, eliminar, agregar)
// ============================================
async function eliminarProducto(id) {
    if (user.role !== "admin") return;
    
    if (!confirm("¿Estás seguro de eliminar este producto?")) return;
    
    try {
        const productosRes = await fetch('http://localhost:3000/api/products');
        const productos = await productosRes.json();
        const productosActualizados = productos.filter(p => p._id !== id && p.id !== parseInt(id));
        
        const response = await fetch('http://localhost:3000/api/products/seed', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(productosActualizados)
        });
        
        if (response.ok) {
            alert('✅ Producto eliminado');
            cargarProductos();
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function editarProducto(id) {
    if (user.role !== "admin") return;
    
    const productosRes = await fetch('http://localhost:3000/api/products');
    const productos = await productosRes.json();
    const producto = productos.find(p => p._id === id || p.id === parseInt(id));
    
    if (!producto) return;
    
    const nuevoNombre = prompt("Nuevo nombre:", producto.name);
    if (nuevoNombre === null) return;
    
    const nuevoPrecio = prompt("Nuevo precio:", producto.price);
    if (nuevoPrecio === null) return;
    
    producto.name = nuevoNombre || producto.name;
    producto.price = parseFloat(nuevoPrecio) || producto.price;
    
    const response = await fetch('http://localhost:3000/api/products/seed', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(productos)
    });
    
    if (response.ok) {
        alert('✅ Producto actualizado');
        cargarProductos();
    }
}

document.getElementById("btn-agregar")?.addEventListener("click", () => {
    if (user.role !== "admin") return;
    
    const nombre = prompt("Nombre del producto:");
    if (!nombre) return;
    
    const precio = prompt("Precio:");
    if (!precio) return;
    
    const categoria = prompt("Categoría:");
    const imagen = prompt("URL de la imagen:");
    
    // Implementar agregar producto
    alert("Función de agregar en desarrollo 🚧");
});

// ============================================
// 7. CERRAR SESIÓN
// ============================================
document.getElementById("btn-cerrar-sesion").onclick = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "login.html";
};

// Exponer funciones globales
window.eliminarProducto = eliminarProducto;
window.editarProducto = editarProducto;