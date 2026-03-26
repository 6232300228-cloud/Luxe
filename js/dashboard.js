// ============================================
// 1. VALIDAR USUARIO Y ROL
// ============================================
const user = JSON.parse(localStorage.getItem("user"));
const token = localStorage.getItem("token");

// Si no hay sesión o el usuario es cliente, redirigir
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
        const btnAgregar = document.getElementById("btn-agregar");
        if (btnAgregar) {
            btnAgregar.classList.remove("hidden");
            btnAgregar.onclick = () => {
                mostrarModalAgregarProducto();
            };
        }
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
        const response = await fetch('https://luxe-api-frr5.onrender.com/api/products');
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const productos = await response.json();
        console.log('📦 Productos cargados:', productos.length);
        
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
                    <button class="btn-accion btn-editar" onclick="editarProducto(${p.id})">✏️ Editar</button>
                    <button class="btn-accion btn-borrar" onclick="eliminarProducto(${p.id})">🗑️ Eliminar</button>
                `;
            } else {
                btns = `<span style="color: #888;"> Solo lectura</span>`;
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
        const response = await fetch('https://luxe-api-frr5.onrender.com/api/orders/mis-pedidos', {
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
// 6. CERRAR SESIÓN
// ============================================
document.getElementById("btn-cerrar-sesion").onclick = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "login.html";
};

// ============================================
// 7. EDITAR PRODUCTO
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
        const response = await fetch('https://luxe-api-frr5.onrender.com/api/products');
        const productos = await response.json();
        const producto = productos.find(p => p.id == id);
        
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
// 8. MOSTRAR MODAL EDITAR PRODUCTO
// ============================================
function mostrarModalEditarProducto(producto) {
    if (!document.getElementById('modalEditarProducto')) {
        const modalHTML = `
            <div id="modalEditarProducto" class="modal-producto" style="display: none;">
                <div class="modal-contenido">
                    <div class="modal-header">
                        <h3>✏️ Editar Producto</h3>
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
        
        if (!document.getElementById('modalStyles')) {
            const styles = `
                <style id="modalStyles">
                    .modal-producto {
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background: rgba(0,0,0,0.5);
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        z-index: 10000;
                    }
                    .modal-contenido {
                        background: white;
                        border-radius: 20px;
                        width: 90%;
                        max-width: 550px;
                        max-height: 90vh;
                        overflow-y: auto;
                    }
                    .modal-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 20px 25px;
                        border-bottom: 2px solid #ff4d6d;
                    }
                    .modal-header h3 { margin: 0; color: #ff4d6d; }
                    .cerrar-modal { font-size: 28px; cursor: pointer; color: #999; }
                    .cerrar-modal:hover { color: #ff4d6d; }
                    .modal-body { padding: 25px; }
                    .form-group { margin-bottom: 18px; }
                    .form-group label { display: block; font-weight: 600; margin-bottom: 6px; font-size: 13px; }
                    .form-group input, .form-group select, .form-group textarea {
                        width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 10px;
                    }
                    .modal-footer { padding: 20px 25px; border-top: 1px solid #eee; display: flex; justify-content: flex-end; gap: 12px; }
                    .btn-cancelar { background: #f0f0f0; color: #666; border: none; padding: 10px 25px; border-radius: 25px; cursor: pointer; }
                    .btn-guardar { background: #ff4d6d; color: white; border: none; padding: 10px 25px; border-radius: 25px; cursor: pointer; }
                    .btn-guardar:hover { background: #ff3355; }
                </style>
            `;
            document.head.insertAdjacentHTML('beforeend', styles);
        }
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

async function guardarEdicionProducto() {
    const id = document.getElementById('editProductoId').value;
    const name = document.getElementById('editProductoNombre').value;
    const price = parseFloat(document.getElementById('editProductoPrecio').value);
    const category = document.getElementById('editProductoCategoria').value;
    const brand = document.getElementById('editProductoMarca').value;
    const img = document.getElementById('editProductoImg').value;
    const desc = document.getElementById('editProductoDesc').value;
    const stock = parseInt(document.getElementById('editProductoStock').value);
    
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
        
        if (response.ok) {
            Swal.fire({
                icon: 'success',
                title: '✅ Producto actualizado',
                text: `${name} ha sido actualizado`,
                timer: 1500,
                showConfirmButton: false,
                toast: true,
                position: 'top-end'
            });
            cerrarModalEditar();
            cargarProductos();
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
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
// 9. ELIMINAR PRODUCTO
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
                title: '✅ Producto eliminado',
                text: data.mensaje || 'Producto eliminado exitosamente',
                timer: 1500,
                showConfirmButton: false,
                toast: true,
                position: 'top-end'
            });
            cargarProductos();
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
// 10. AGREGAR NUEVO PRODUCTO
// ============================================
function mostrarModalAgregarProducto() {
    if (!document.getElementById('modalProducto')) {
        const modalHTML = `
            <div id="modalProducto" class="modal-producto" style="display: none;">
                <div class="modal-contenido">
                    <div class="modal-header">
                        <h3>➕ Agregar Nuevo Producto</h3>
                        <span class="cerrar-modal" onclick="cerrarModalAgregar()">&times;</span>
                    </div>
                    <div class="modal-body">
                        <form id="formProducto">
                            <div class="form-group">
                                <label>ID del producto *</label>
                                <input type="number" id="productoId" placeholder="Ej: 51" required>
                            </div>
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
                                <input type="text" id="productoImg" placeholder="Ej: img/nuevo-producto.png">
                            </div>
                            <div class="form-group">
                                <label>Descripción</label>
                                <textarea id="productoDesc" rows="3"></textarea>
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
    
    document.getElementById('modalProducto').style.display = 'flex';
}

function cerrarModalAgregar() {
    const modal = document.getElementById('modalProducto');
    if (modal) modal.style.display = 'none';
}

async function guardarNuevoProducto() {
    const id = document.getElementById('productoId').value;
    const name = document.getElementById('productoNombre').value;
    const price = document.getElementById('productoPrecio').value;
    const category = document.getElementById('productoCategoria').value;
    const brand = document.getElementById('productoMarca').value;
    const img = document.getElementById('productoImg').value || 'img/default.png';
    const desc = document.getElementById('productoDesc').value;
    const stock = document.getElementById('productoStock').value;
    
    if (!id || !name || !price || !category) {
        Swal.fire({
            icon: 'error',
            title: 'Campos incompletos',
            text: 'ID, nombre, precio y categoría son obligatorios',
            timer: 1500,
            showConfirmButton: false,
            toast: true,
            position: 'top-end'
        });
        return;
    }
    
    try {
        const response = await fetch('https://luxe-api-frr5.onrender.com/api/products/crear', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                id: parseInt(id),
                name,
                price: parseFloat(price),
                category,
                brand,
                img,
                desc,
                stock: parseInt(stock)
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            Swal.fire({
                icon: 'success',
                title: '✅ Producto creado',
                text: `${name} ha sido agregado`,
                timer: 1500,
                showConfirmButton: false,
                toast: true,
                position: 'top-end'
            });
            cerrarModalAgregar();
            cargarProductos();
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: data.error || 'No se pudo crear',
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

// Hacer funciones globales
window.editarProducto = editarProducto;
window.eliminarProducto = eliminarProducto;
window.mostrarModalAgregarProducto = mostrarModalAgregarProducto;
window.cerrarModalEditar = cerrarModalEditar;
window.guardarEdicionProducto = guardarEdicionProducto;
window.cerrarModalAgregar = cerrarModalAgregar;
window.guardarNuevoProducto = guardarNuevoProducto;
window.cargarProductos = cargarProductos;

console.log('✅ Dashboard.js cargado correctamente');