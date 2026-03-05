// js/pedidos.js

async function cargarPedidos() {
    const contenedor = document.getElementById("contenedor-pedidos");
    
    // Obtener usuario y token del localStorage
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    // Verificar si el usuario está logueado
    if (!token || !user) {
        contenedor.innerHTML = `
            <div class="card" style="padding: 40px; text-align: center;">
                <h2 style="color: #ff4d6d;">🔒 Inicia sesión para ver tus pedidos</h2>
                <p>Necesitas iniciar sesión para ver el historial de tus compras.</p>
                <a href="login.html" style="display: inline-block; background: #ff4d6d; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; margin-top: 20px;">
                    Ir a iniciar sesión
                </a>
            </div>
        `;
        return;
    }

    try {
        // Mostrar carga
        contenedor.innerHTML = `<div style="text-align: center; padding: 40px;">Cargando tus pedidos... ⏳</div>`;

        // 🔥 Llamar al backend para obtener los pedidos REALES desde MongoDB
        const response = await fetch('http://localhost:3000/api/orders/mis-pedidos', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Error al cargar pedidos');
        }

        const pedidos = await response.json();

        // Si no hay pedidos
        if (pedidos.length === 0) {
            contenedor.innerHTML = `
                <div class="card" style="padding: 50px; text-align: center;">
                    <h2 style="color: #ff4d6d;">Aún no tienes pedidos 💔</h2>
                    <p>Hola ${user.nombre}, cuando realices tu primera compra, aparecerá aquí.</p>
                    <a href="index.html" style="display: inline-block; background: #ff4d6d; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; margin-top: 20px;">
                        Ir a la tienda
                    </a>
                </div>
            `;
            return;
        }

        // Mostrar los pedidos (ordenados del más reciente al más antiguo)
        contenedor.innerHTML = "";

        pedidos.reverse().forEach((pedido) => {
            const div = document.createElement("div");
            div.classList.add("card-pedido");
            
            // Formatear fecha
            const fecha = new Date(pedido.fechaPedido).toLocaleDateString('es-MX', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            // Crear lista de productos
            let listaProductos = pedido.productos.map(p => 
                `<li style="margin-bottom: 5px;">
                    ${p.nombre} 
                    <span style="color: #ff4d6d;">x${p.cantidad || 1}</span> 
                    - $${(p.precio * (p.cantidad || 1)).toFixed(2)}
                </li>`
            ).join("");

            // Determinar color del estado
            const colorEstado = {
                'pendiente': '#ff4d6d',
                'pagado': '#1976d2',
                'enviado': '#f57c00',
                'entregado': '#388e3c',
                'cancelado': '#999'
            }[pedido.estado] || '#ff4d6d';

            div.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eee; padding-bottom: 15px;">
                    <div>
                        <span><b>Pedido #${pedido._id.slice(-8)}</b></span>
                        <p style="font-size: 12px; color: #666; margin: 5px 0 0 0;">${fecha}</p>
                    </div>
                    <span style="background: ${colorEstado}20; color: ${colorEstado}; padding: 5px 15px; border-radius: 20px; font-weight: bold;">
                        ${pedido.estado.toUpperCase()}
                    </span>
                </div>
                
                <div style="padding: 15px 0; text-align: left;">
                    <p style="margin: 5px 0;"><b>Dirección de envío:</b> ${pedido.usuario.direccion || 'No especificada'}</p>
                    <p style="margin: 5px 0;"><b>Método de pago:</b> ${pedido.metodoPago}</p>
                </div>

                <div style="padding-top: 10px; text-align: left;">
                    <p><b>Productos:</b></p>
                    <ul style="font-size: 14px; color: #555; padding-left: 20px;">
                        ${listaProductos}
                    </ul>
                </div>

                <div style="text-align: right; margin-top: 15px; padding-top: 15px; border-top: 2px solid #ff4d6d;">
                    <strong style="font-size: 18px; color: #ff4d6d;">
                        Total: $${pedido.total.toFixed(2)}
                    </strong>
                </div>
            `;
            
            contenedor.appendChild(div);
        });

    } catch (error) {
        console.error('Error cargando pedidos:', error);
        contenedor.innerHTML = `
            <div class="card" style="padding: 40px; text-align: center;">
                <h2 style="color: #ff4d6d;">❌ Error al cargar los pedidos</h2>
                <p>Hubo un problema al cargar tu historial. Por favor intenta de nuevo.</p>
                <button onclick="cargarPedidos()" style="background: #ff4d6d; color: white; border: none; padding: 10px 25px; border-radius: 25px; cursor: pointer; margin-top: 20px;">
                    Reintentar
                </button>
            </div>
        `;
    }
}

// Cargar pedidos al iniciar la página
document.addEventListener("DOMContentLoaded", cargarPedidos);