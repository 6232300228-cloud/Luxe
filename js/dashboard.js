// ============================================
// VARIABLES GLOBALES
// ============================================
let productosGlobales = [];
let currentFilter = 'default';
let currentSearchTerm = '';

// ============================================
// VALIDAR USUARIO Y ROL
// ============================================
const user = JSON.parse(localStorage.getItem("user"));
const token = localStorage.getItem("token");

if (!user || !token || (user.role !== "admin" && user.role !== "empleado")) {
    Swal.fire({
        icon: 'warning',
        title: 'Acceso restringido',
        text: 'Solo personal autorizado puede acceder al dashboard',
        timer: 2000,
        showConfirmButton: false
    }).then(() => {
        window.location.href = "login.html";
    });
}

// ============================================
// CONFIGURACIÓN INICIAL
// ============================================
document.addEventListener("DOMContentLoaded", async () => {
    document.getElementById("nombre-usuario").innerText = user.nombre;
    const badge = document.getElementById("rol-usuario");
    badge.innerText = user.role.toUpperCase();
    badge.classList.add(user.role === "admin" ? "badge-admin" : "badge-empleado");

    // Mostrar botón agregar solo para admin
    if (user.role === "admin") {
        const btnAgregar = document.getElementById("btn-agregar");
        if (btnAgregar) {
            btnAgregar.classList.remove("hidden");
            btnAgregar.onclick = () => {
                mostrarModalAgregarProducto();
            };
        }
    }

    // Configurar eventos de navegación
    setupNavigation();
    
    // Configurar buscador y filtros
    setupSearchAndFilters();
    
    // Cargar datos
    await cargarProductos();
    await cargarEstadisticas();
    await cargarVentas();
    await crearGrafica();
});

// ============================================
// NAVEGACIÓN ENTRE SECCIONES
// ============================================
function setupNavigation() {
    const inventarioSection = document.getElementById('inventario-section');
    const ventasSection = document.getElementById('ventas-section');
    const menuInventario = document.getElementById('menu-inventario');
    const menuVentas = document.getElementById('menu-ventas');
    
    menuInventario.addEventListener('click', () => {
        inventarioSection.classList.remove('hidden');
        ventasSection.classList.remove('active');
        ventasSection.style.display = 'none';
        inventarioSection.style.display = 'block';
        
        menuInventario.style.color = '#ff4d6d';
        menuInventario.style.fontWeight = 'bold';
        menuVentas.style.color = '#333';
        menuVentas.style.fontWeight = 'normal';
    });
    
    menuVentas.addEventListener('click', () => {
        inventarioSection.style.display = 'none';
        ventasSection.style.display = 'block';
        ventasSection.classList.add('active');
        
        menuVentas.style.color = '#ff4d6d';
        menuVentas.style.fontWeight = 'bold';
        menuInventario.style.color = '#333';
        menuInventario.style.fontWeight = 'normal';
    });
}

// ============================================
// CONFIGURAR BUSCADOR Y FILTROS
// ============================================
function setupSearchAndFilters() {
    const searchInput = document.getElementById('buscador-producto');
    const searchBtn = document.getElementById('btn-buscar');
    const filterSelect = document.getElementById('filtro-orden');
    
    searchBtn.addEventListener('click', () => {
        currentSearchTerm = searchInput.value.toLowerCase().trim();
        aplicarFiltrosYOrden();
    });
    
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            currentSearchTerm = searchInput.value.toLowerCase().trim();
            aplicarFiltrosYOrden();
        }
    });
    
    filterSelect.addEventListener('change', (e) => {
        currentFilter = e.target.value;
        aplicarFiltrosYOrden();
    });
}

function aplicarFiltrosYOrden() {
    let productosFiltrados = [...productosGlobales];
    
    // Aplicar búsqueda
    if (currentSearchTerm) {
        productosFiltrados = productosFiltrados.filter(p => 
            p.name.toLowerCase().includes(currentSearchTerm) ||
            (p.category && p.category.toLowerCase().includes(currentSearchTerm))
        );
    }
    
    // Aplicar ordenamiento
    switch(currentFilter) {
        case 'az':
            productosFiltrados.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'za':
            productosFiltrados.sort((a, b) => b.name.localeCompare(a.name));
            break;
        case 'precio-mayor':
            productosFiltrados.sort((a, b) => b.price - a.price);
            break;
        case 'precio-menor':
            productosFiltrados.sort((a, b) => a.price - b.price);
            break;
        default:
            productosFiltrados.sort((a, b) => a.id - b.id);
    }
    
    renderizarTablaProductos(productosFiltrados);
}
async function cargarClientes() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    
    // Verificar que sea admin
    if (!user || user.role !== 'admin') {
        console.log('No eres admin');
        return;
    }
    
    try {
        const response = await fetch('https://luxe-api-frr5.onrender.com/api/auth/usuarios', {
            headers: {
                'Authorization': 'Bearer ' + token
            }
        });
        
        if (response.ok) {
            const usuarios = await response.json();
            console.log('Clientes cargados:', usuarios.length);
            
            // Mostrar en tu tabla
            const tbody = document.getElementById('clientes-tbody');
            if (tbody) {
                tbody.innerHTML = '';
                usuarios.forEach(usuario => {
                    const row = `
                        <tr>
                            <td>${usuario.nombre || '-'}</td>
                            <td>${usuario.correo}</td>
                            <td>${usuario.role || 'cliente'}</td>
                            <td>${new Date(usuario.fechaRegistro).toLocaleDateString()}</td>
                        </tr>
                    `;
                    tbody.innerHTML += row;
                });
            }
        } else {
            console.error('Error al cargar clientes');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// Llamar a la función cuando carga el dashboard
document.addEventListener('DOMContentLoaded', function() {
    cargarClientes();
});
// ============================================
// CARGAR PRODUCTOS
// ============================================
async function cargarProductos() {
    const tabla = document.getElementById("lista-inventario");
    tabla.innerHTML = '<tr><td colspan="6" style="text-align: center;">Cargando productos...</td></tr>';
    
    try {
        const response = await fetch('https://luxe-api-frr5.onrender.com/api/products');
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        productosGlobales = await response.json();
        
        if (productosGlobales.length === 0) {
            tabla.innerHTML = '<tr><td colspan="6" style="text-align: center;">No hay productos cargados</td></tr>';
            return;
        }
        
        aplicarFiltrosYOrden();
        
    } catch (error) {
        console.error('Error cargando productos:', error);
        tabla.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; color: red; padding: 40px;">
                    Error al cargar productos<br>
                    <small>${error.message}</small><br>
                    <button onclick="cargarProductos()" style="margin-top: 10px; padding: 5px 15px;">Reintentar</button>
                </td>
            </tr>
        `;
    }
}

function renderizarTablaProductos(productos) {
    const tabla = document.getElementById("lista-inventario");
    tabla.innerHTML = "";
    
    productos.forEach(p => {
        const tr = document.createElement("tr");
        
        let stockColor = '#4CAF50';
        if (p.stock <= 0) stockColor = '#f44336';
        else if (p.stock <= 20) stockColor = '#ff9800';
        
        let btns = '';
        if (user.role === "admin") {
            btns = `
                <button class="btn-accion btn-editar" onclick="editarProducto(${p.id})">Editar</button>
                <button class="btn-accion btn-borrar" onclick="eliminarProducto(${p.id})">Eliminar</button>
            `;
        } else {
            btns = `<span style="color: #888;">Solo lectura</span>`;
        }
        
        tr.innerHTML = `
            <td style="text-align: center; vertical-align: middle;">
                <img src="${p.img}" width="50" height="50" style="border-radius: 8px; object-fit: cover;" onerror="this.src='img/logo.png'">
            </td>
            <td><b>${p.name}</b><br><small style="color: #888;">ID: ${p.id}</small></td>
            <td>${p.category || 'Sin categoría'}</td>
            <td style="font-weight: bold; color: #ff4d6d;">$${p.price}</td>
            <td style="color: ${stockColor}; font-weight: bold;">${p.stock || 0} unidades</td>
            <td>${btns}</td>
        `;
        tabla.appendChild(tr);
    });
    
    if (productos.length === 0) {
        tabla.innerHTML = '<tr><td colspan="6" style="text-align: center;">No se encontraron productos</td></tr>';
    }
}

// ============================================
// CARGAR ESTADÍSTICAS
// ============================================
async function cargarEstadisticas() {
    try {
        const responsePedidos = await fetch('https://luxe-api-frr5.onrender.com/api/orders/mis-pedidos', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!responsePedidos.ok) {
            throw new Error('Error obteniendo pedidos');
        }
        
        const pedidos = await responsePedidos.json();
        
        const responseUsers = await fetch('https://luxe-api-frr5.onrender.com/api/users', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        let clientes = [];
        if (responseUsers.ok) {
            const allUsers = await responseUsers.json();
            clientes = allUsers.filter(u => u.role === 'cliente');
        }
        
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
        
        const clientesNuevos = clientes.filter(c => {
            const fechaRegistro = new Date(c.createdAt || c.fechaRegistro);
            return fechaRegistro.getMonth() === mesActual && fechaRegistro.getFullYear() === añoActual;
        }).length;
        
        document.getElementById("total-ventas").innerText = `$${ventasMes.toFixed(2)}`;
        document.getElementById("cantidad-vendida").innerText = productosVendidos;
        document.getElementById("clientes-nuevos").innerText = clientesNuevos;
        
    } catch (error) {
        console.error('Error cargando estadísticas:', error);
        document.getElementById("clientes-nuevos").innerText = "0";
    }
}

// ============================================
// CARGAR VENTAS
// ============================================
async function cargarVentas() {
    const tabla = document.getElementById("lista-ventas");
    tabla.innerHTML = '<tr><td colspan="6" style="text-align: center;">Cargando ventas...</td></tr>';
    
    try {
        const response = await fetch('https://luxe-api-frr5.onrender.com/api/orders/mis-pedidos', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) {
            throw new Error('Error obteniendo pedidos');
        }
        
        const pedidos = await response.json();
        
        if (pedidos.length === 0) {
            tabla.innerHTML = '<tr><td colspan="6" class="empty-state">No hay ventas registradas</td></tr>';
            return;
        }
        
        tabla.innerHTML = "";
        
        for (const pedido of pedidos) {
            const tr = document.createElement("tr");
            
            let clienteNombre = 'Cliente';
            if (pedido.userId) {
                try {
                    const userResponse = await fetch(`https://luxe-api-frr5.onrender.com/api/users/${pedido.userId}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (userResponse.ok) {
                        const userData = await userResponse.json();
                        clienteNombre = userData.nombre || 'Cliente';
                    }
                } catch (e) {
                    console.error('Error obteniendo cliente:', e);
                }
            }
            
            const fecha = new Date(pedido.fechaPedido);
            const fechaFormateada = fecha.toLocaleDateString('es-ES');
            const estadoClass = pedido.estado === 'pagado' ? 'status-pagado' : 'status-pendiente';
            const productosList = pedido.productos ? pedido.productos.map(p => `${p.nombre} x${p.cantidad}`).join(', ') : '-';
            
            tr.innerHTML = `
                <td>#${pedido.id}</td>
                <td>${clienteNombre}</td>
                <td>${fechaFormateada}</td>
                <td style="font-weight: bold; color: #ff4d6d;">$${pedido.total || 0}</td>
                <td class="${estadoClass}">${pedido.estado || 'pendiente'}</td>
                <td style="max-width: 200px; font-size: 12px;">${productosList}</td>
            `;
            tabla.appendChild(tr);
        }
        
    } catch (error) {
        console.error('Error cargando ventas:', error);
        tabla.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; color: red; padding: 40px;">
                    Error al cargar ventas<br>
                    <small>${error.message}</small>
                </td>
            </tr>
        `;
    }
}

// ============================================
// CREAR GRÁFICA
// ============================================
async function crearGrafica() {
    try {
        const response = await fetch('https://luxe-api-frr5.onrender.com/api/orders/mis-pedidos', {
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
// CERRAR SESIÓN
// ============================================
document.getElementById("btn-cerrar-sesion").onclick = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "login.html";
};

// ============================================
// EDITAR PRODUCTO
// ============================================
async function editarProducto(id) {
    if (user.role !== 'admin') {
        Swal.fire({
            icon: 'error',
            title: 'Acceso denegado',
            text: 'Solo los administradores pueden editar productos',
            timer: 2000,
            showConfirmButton: false,
            toast: true,
            position: 'top-end'
        });
        return;
    }
    
    try {
        const producto = productosGlobales.find(p => p.id == id);
        
        if (!producto) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Producto no encontrado',
                timer: 1500,
                showConfirmButton: false
            });
            return;
        }
        
        mostrarModalEditarProducto(producto);
        
    } catch (error) {
        console.error('Error:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo cargar el producto',
            timer: 1500,
            showConfirmButton: false
        });
    }
}

// ============================================
// MOSTRAR MODAL EDITAR PRODUCTO
// ============================================
function mostrarModalEditarProducto(producto) {
    if (!document.getElementById('modalEditarProducto')) {
        const modalHTML = `
            <div id="modalEditarProducto" class="modal-producto" style="display: none;">
                <div class="modal-contenido">
                    <div class="modal-header">
                        <h3>Editar Producto</h3>
                        <span class="cerrar-modal" onclick="cerrarModalEditar()">&times;</span>
                    </div>
                    <div class="modal-body">
                        <form id="formEditarProducto">
                            <div class="form-group">
                                <label>ID del producto</label>
                                <input type="number" id="editProductoId" readonly disabled style="background: #f0f0f0;">
                            </div>
                            <div class="form-group">
                                <label>Nombre del producto *</label>
                                <input type="text" id="editProductoNombre" required>
                            </div>
                            <div class="form-group">
                                <label>Precio *</label>
                                <input type="number" id="editProductoPrecio" step="0.01" required>
                            </div>
                            <div class="form-group">
                                <label>Categoría *</label>
                                <select id="editProductoCategoria" required>
                                    <option value="">Selecciona una categoría</option>
                                    <option value="labial">Labial</option>
                                    <option value="sombra">Sombra</option>
                                    <option value="base">Base</option>
                                    <option value="corrector">Corrector</option>
                                    <option value="ojos">Ojos</option>
                                    <option value="rubor">Rubor</option>
                                    <option value="iluminador">Iluminador</option>
                                    <option value="skincare">Skincare</option>
                                    <option value="accesorios">Accesorios</option>
                                    <option value="rostro">Rostro</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Marca</label>
                                <select id="editProductoMarca">
                                    <option value="">Selecciona una marca</option>
                                    <option value="bissu">Bissu</option>
                                    <option value="nyx">NYX</option>
                                    <option value="maybelline">Maybelline</option>
                                    <option value="loreal">L'Oréal</option>
                                    <option value="rare">Rare Beauty</option>
                                    <option value="fenty">Fenty</option>
                                    <option value="dior">Dior</option>
                                    <option value="mac">MAC</option>
                                    <option value="luxe">Luxe</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Imagen (URL o ruta)</label>
                                <input type="text" id="editProductoImg">
                            </div>
                            <div class="form-group">
                                <label>Descripción</label>
                                <textarea id="editProductoDesc" rows="3"></textarea>
                            </div>
                            <div class="form-group">
                                <label>Stock</label>
                                <input type="number" id="editProductoStock" value="100">
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button onclick="cerrarModalEditar()" class="btn-cancelar">Cancelar</button>
                        <button onclick="guardarEdicionProducto()" class="btn-guardar">Guardar Cambios</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }
    
    document.getElementById('editProductoId').value = producto.id;
    document.getElementById('editProductoNombre').value = producto.name;
    document.getElementById('editProductoPrecio').value = producto.price;
    document.getElementById('editProductoCategoria').value = producto.category || '';
    document.getElementById('editProductoMarca').value = producto.brand || '';
    document.getElementById('editProductoImg').value = producto.img || '';
    document.getElementById('editProductoDesc').value = producto.desc || '';
    document.getElementById('editProductoStock').value = producto.stock || 100;
    
    document.getElementById('modalEditarProducto').style.display = 'flex';
}

function cerrarModalEditar() {
    const modal = document.getElementById('modalEditarProducto');
    if (modal) modal.style.display = 'none';
}

// ============================================
// GUARDAR EDICIÓN DE PRODUCTO
// ============================================
async function guardarEdicionProducto() {
    const id = document.getElementById('editProductoId').value;
    const name = document.getElementById('editProductoNombre').value;
    const price = parseFloat(document.getElementById('editProductoPrecio').value);
    const category = document.getElementById('editProductoCategoria').value;
    const brand = document.getElementById('editProductoMarca').value;  // ← MARCA
    const img = document.getElementById('editProductoImg').value;
    const desc = document.getElementById('editProductoDesc').value;
    const stock = parseInt(document.getElementById('editProductoStock').value);
    
    console.log(" Enviando actualización:", { id, name, price, category, brand, stock }); // ← Agrega este log
    
    if (!name || !price || !category) {
        Swal.fire({
            icon: 'error',
            title: 'Campos incompletos',
            text: 'Nombre, precio y categoría son obligatorios',
            timer: 1500,
            showConfirmButton: false,
            toast: true,
            position: 'top-end'
        });
        return;
    }
    
    Swal.fire({
        title: 'Guardando cambios...',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
    
    try {
        const response = await fetch(`https://luxe-api-frr5.onrender.com/api/products/actualizar/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ name, price, category, brand, img, desc, stock })
        });
        
        const data = await response.json();
        console.log("Respuesta de la API:", data); // ← Agrega este log
        
        if (response.ok) {
            Swal.fire({
                icon: 'success',
                title: 'Producto actualizado',
                text: `${name} - Marca: ${brand || 'Sin marca'}`,
                timer: 2000,
                showConfirmButton: false,
                toast: true,
                position: 'top-end'
            });
            cerrarModalEditar();
            await cargarProductos();
            
            localStorage.removeItem('productosCache');
            localStorage.setItem('productosActualizados', Date.now().toString());
            
        } else {
            Swal.fire({
                icon: 'error',
                title: ' Error',
                text: data.error || 'No se pudo actualizar',
                timer: 1500,
                showConfirmButton: false,
                toast: true,
                position: 'top-end'
            });
        }
    } catch (error) {
        console.error('Error:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error de conexión',
            text: 'No se pudo conectar con el servidor',
            timer: 1500,
            showConfirmButton: false,
            toast: true,
            position: 'top-end'
        });
    }
}
// ============================================
// ELIMINAR PRODUCTO
// ============================================
async function eliminarProducto(id) {
    if (user.role !== 'admin') {
        Swal.fire({
            icon: 'error',
            title: 'Acceso denegado',
            text: 'Solo los administradores pueden eliminar productos',
            timer: 2000,
            showConfirmButton: false,
            toast: true,
            position: 'top-end'
        });
        return;
    }
    
    const confirmar = await Swal.fire({
        title: '¿Eliminar producto?',
        text: 'Esta acción no se puede deshacer',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ff4d6d',
        cancelButtonColor: '#666',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    });
    
    if (!confirmar.isConfirmed) return;
    
    try {
        const response = await fetch(`https://luxe-api-frr5.onrender.com/api/products/eliminar/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            Swal.fire({
                icon: 'success',
                title: 'Producto eliminado',
                text: data.mensaje || 'Producto eliminado exitosamente',
                timer: 1500,
                showConfirmButton: false,
                toast: true,
                position: 'top-end'
            });
            await cargarProductos();
            
            localStorage.removeItem('productosCache');
            localStorage.setItem('productosActualizados', Date.now().toString());
            
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: data.error || 'No se pudo eliminar',
                timer: 1500,
                showConfirmButton: false,
                toast: true,
                position: 'top-end'
            });
        }
    } catch (error) {
        console.error('Error:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error de conexión',
            text: 'No se pudo conectar con el servidor',
            timer: 1500,
            showConfirmButton: false,
            toast: true,
            position: 'top-end'
        });
    }
}

// ============================================
// AGREGAR NUEVO PRODUCTO
// ============================================
function mostrarModalAgregarProducto() {
    const existingModal = document.getElementById('modalProducto');
    if (existingModal) {
        existingModal.remove();
    }
    
    const modalHTML = `
        <div id="modalProducto" class="modal-producto" style="display: flex;">
            <div class="modal-contenido">
                <div class="modal-header">
                    <h3>Agregar Nuevo Producto</h3>
                    <span class="cerrar-modal" onclick="cerrarModalAgregar()">&times;</span>
                </div>
                <div class="modal-body">
                    <form id="formProducto">
                        <div class="form-group">
                            <label>Nombre del producto *</label>
                            <input type="text" id="productoNombre" placeholder="Ej: Labial Mate Rosa" required>
                        </div>
                        <div class="form-group">
                            <label>Precio *</label>
                            <input type="number" id="productoPrecio" placeholder="Ej: 250" step="0.01" required>
                        </div>
                        <div class="form-group">
                            <label>Categoría *</label>
                            <select id="productoCategoria" required>
                                <option value="">Selecciona una categoría</option>
                                <option value="labial">Labial</option>
                                <option value="sombra">Sombra</option>
                                <option value="base">Base</option>
                                <option value="corrector">Corrector</option>
                                <option value="ojos">Ojos</option>
                                <option value="rubor">Rubor</option>
                                <option value="iluminador">Iluminador</option>
                                <option value="skincare">Skincare</option>
                                <option value="accesorios">Accesorios</option>
                                <option value="rostro">Rostro</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Marca</label>
                            <select id="productoMarca">
                                <option value="">Selecciona una marca</option>
                                <option value="bissu">Bissu</option>
                                <option value="nyx">NYX</option>
                                <option value="maybelline">Maybelline</option>
                                <option value="loreal">L'Oréal</option>
                                <option value="rare">Rare Beauty</option>
                                <option value="fenty">Fenty</option>
                                <option value="dior">Dior</option>
                                <option value="mac">MAC</option>
                                <option value="luxe">Luxe</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Imagen (URL o ruta)</label>
                            <input type="text" id="productoImg" placeholder="Ej: img/nuevo-producto.png" value="img/default.png">
                        </div>
                        <div class="form-group">
                            <label>Descripción</label>
                            <textarea id="productoDesc" rows="3" placeholder="Descripción del producto..."></textarea>
                        </div>
                        <div class="form-group">
                            <label>Stock inicial</label>
                            <input type="number" id="productoStock" value="100">
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button onclick="cerrarModalAgregar()" class="btn-cancelar">Cancelar</button>
                    <button onclick="guardarNuevoProducto()" class="btn-guardar">Guardar Producto</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function cerrarModalAgregar() {
    const modal = document.getElementById('modalProducto');
    if (modal) modal.remove();
}

// ============================================
// GUARDAR NUEVO PRODUCTO
// ============================================
async function guardarNuevoProducto() {
    const name = document.getElementById('productoNombre').value;
    const price = parseFloat(document.getElementById('productoPrecio').value);
    const category = document.getElementById('productoCategoria').value;
    const brand = document.getElementById('productoMarca').value;
    const img = document.getElementById('productoImg').value || 'img/default.png';
    const desc = document.getElementById('productoDesc').value;
    const stock = parseInt(document.getElementById('productoStock').value);
    
    if (!name || !price || !category) {
        Swal.fire({
            icon: 'error',
            title: 'Campos incompletos',
            text: 'Nombre, precio y categoría son obligatorios',
            timer: 1500,
            showConfirmButton: false,
            toast: true,
            position: 'top-end'
        });
        return;
    }
    
    const newId = productosGlobales.length > 0 ? Math.max(...productosGlobales.map(p => p.id)) + 1 : 1;
    
    try {
        const response = await fetch('https://luxe-api-frr5.onrender.com/api/products/crear', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                id: newId,
                name,
                price,
                category,
                brand,
                img,
                desc,
                stock
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            Swal.fire({
                icon: 'success',
                title: 'Producto creado',
                text: `${name} ha sido agregado`,
                timer: 1500,
                showConfirmButton: false,
                toast: true,
                position: 'top-end'
            });
            cerrarModalAgregar();
            await cargarProductos();
            
            localStorage.removeItem('productosCache');
            localStorage.setItem('productosActualizados', Date.now().toString());
            
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: data.error || 'No se pudo crear el producto',
                timer: 1500,
                showConfirmButton: false,
                toast: true,
                position: 'top-end'
            });
        }
    } catch (error) {
        console.error('Error:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error de conexión',
            text: 'No se pudo conectar con el servidor',
            timer: 1500,
            showConfirmButton: false,
            toast: true,
            position: 'top-end'
        });
    }
}

// ============================================
// HACER FUNCIONES GLOBALES
// ============================================
window.editarProducto = editarProducto;
window.eliminarProducto = eliminarProducto;
window.mostrarModalAgregarProducto = mostrarModalAgregarProducto;
window.cerrarModalEditar = cerrarModalEditar;
window.guardarEdicionProducto = guardarEdicionProducto;
window.cerrarModalAgregar = cerrarModalAgregar;
window.guardarNuevoProducto = guardarNuevoProducto;
window.cargarProductos = cargarProductos;