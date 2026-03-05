// ============================================
// 1. VALIDAR USUARIO Y ROL
// ============================================
const user = JSON.parse(localStorage.getItem("user"));
const token = localStorage.getItem("token");

// Si no hay sesión o el usuario es cliente, redirigir
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

    // Cargar datos
    await cargarProductos();
    await cargarEstadisticas();
    await crearGrafica();
});

// ============================================
// 3. CARGAR PRODUCTOS
// ============================================
async function cargarProductos() {
    const tabla = document.getElementById("lista-inventario");
    tabla.innerHTML = '<tr><td colspan="6" style="text-align: center;">Cargando productos...</td></tr>';
    
    try {
        console.log('📦 Intentando cargar productos...');
        
        // Verificar que el servidor responde
        const testResponse = await fetch('http://localhost:3000');
        if (!testResponse.ok) {
            throw new Error('Servidor no disponible');
        }
        
        const response = await fetch('http://localhost:3000/api/products');
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const productos = await response.json();
        console.log('✅ Productos cargados:', productos.length);
        
        if (productos.length === 0) {
            tabla.innerHTML = '<tr><td colspan="6" style="text-align: center;">No hay productos cargados</td></tr>';
            return;
        }

        tabla.innerHTML = "";

        productos.forEach(p => {
            const tr = document.createElement("tr");
            
            // Color según stock
            let stockColor = '#4CAF50';
            if (p.stock <= 0) stockColor = '#f44336';
            else if (p.stock <= 20) stockColor = '#ff9800';
            
            // Botones según rol
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
                <td><img src="${p.img}" width="40" style="border-radius: 5px;" onerror="this.src='img/logo.png'"></td>
                <td><b>${p.name}</b><br><small style="color: #888;">ID: ${p.id}</small></td>
                <td>${p.category || 'Sin categoría'}</td>
                <td style="font-weight: bold; color: #ff4d6d;">$${p.price}</td>
                <td style="color: ${stockColor}; font-weight: bold;">${p.stock || 0} unidades</td>
                <td>${btns}</td>
            `;
            tabla.appendChild(tr);
        });
        
    } catch (error) {
        console.error('❌ Error cargando productos:', error);
        tabla.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; color: red; padding: 40px;">
                    ❌ Error al cargar productos<br>
                    <small>${error.message}</small><br>
                    <button onclick="cargarProductos()" style="margin-top: 10px; padding: 5px 15px;">Reintentar</button>
                </td>
            </tr>
        `;
    }
}

// ============================================
// 4. CARGAR ESTADÍSTICAS
// ============================================
async function cargarEstadisticas() {
    try {
        const response = await fetch('http://localhost:3000/api/orders/mis-pedidos', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) {
            throw new Error('Error obteniendo pedidos');
        }
        
        const pedidos = await response.json();
        
        const hoy = new Date();
        const mesActual = hoy.getMonth();
        const añoActual = hoy.getFullYear();
        
        const ventasMes = pedidos
            .filter(p => {
                const fecha = new Date(p.fechaPedido);
                return fecha.getMonth() === mesActual && fecha.getFullYear() === añoActual;
            })
            .reduce((sum, p) => sum + (p.total || 0), 0);
        
        const productosVendidos = pedidos
            .flatMap(p => p.productos || [])
            .reduce((sum, prod) => sum + (prod.cantidad || 0), 0);
        
        document.getElementById("total-ventas").innerText = `$${ventasMes.toFixed(2)}`;
        document.getElementById("cantidad-vendida").innerText = productosVendidos;
        
    } catch (error) {
        console.error('Error cargando estadísticas:', error);
    }
}

// ============================================
// 5. CREAR GRÁFICA
// ============================================
async function crearGrafica() {
    try {
        const response = await fetch('http://localhost:3000/api/orders/mis-pedidos', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const pedidos = await response.json();
        
        const ventasPorDia = [0, 0, 0, 0, 0, 0, 0];
        const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        
        pedidos.forEach(p => {
            const fecha = new Date(p.fechaPedido);
            const dia = fecha.getDay();
            ventasPorDia[dia] += p.total || 0;
        });

        const ctx = document.getElementById('graficaVentas').getContext('2d');
        
        if (window.miGrafica) {
            window.miGrafica.destroy();
        }
        
        window.miGrafica = new Chart(ctx, {
            type: 'line',
            data: {
                labels: diasSemana,
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
// 6. CERRAR SESIÓN
// ============================================
document.getElementById("btn-cerrar-sesion").onclick = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "login.html";
};

// Funciones vacías para evitar errores
function editarProducto(id) {
    alert('Función en desarrollo');
}

function eliminarProducto(id) {
    alert('Función en desarrollo');
}

window.editarProducto = editarProducto;
window.eliminarProducto = eliminarProducto;