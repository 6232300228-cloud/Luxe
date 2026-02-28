// ticket.js
document.addEventListener("DOMContentLoaded", () => {
    const ticket = JSON.parse(localStorage.getItem("ticket"));
    const contenedor = document.getElementById("ticketInfo");

    if (!ticket) {
        contenedor.innerHTML = "❌ No hay información del ticket";
        return;
    }

    // Formatear fecha
    const fecha = new Date(ticket.fecha).toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    // Generar filas de productos
    const productosHTML = ticket.productos.map(p => `
        <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px;">${p.nombre}</td>
            <td style="padding: 10px; text-align: center;">${p.cantidad}</td>
            <td style="padding: 10px; text-align: right;">$${p.precio.toFixed(2)}</td>
            <td style="padding: 10px; text-align: right; color: #ff4d6d; font-weight: bold;">$${(p.precio * p.cantidad).toFixed(2)}</td>
        </tr>
    `).join("");

    contenedor.innerHTML = `
        <div style="background: white; padding: 30px; border-radius: 15px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); max-width: 800px; margin: 0 auto;">
            <h2 style="color: #ff4d6d; text-align: center; margin-bottom: 30px;">🎉 ¡Gracias por tu compra!</h2>
            
            <div style="background: #f9f9f9; padding: 20px; border-radius: 10px; margin-bottom: 30px;">
                <h3 style="color: #333; margin-top: 0;">📦 Detalles del pedido</h3>
                <p><strong>Pedido #:</strong> ${ticket.id}</p>
                <p><strong>Fecha:</strong> ${fecha}</p>
                <p><strong>Cliente:</strong> ${ticket.cliente || 'No especificado'}</p>
                <p><strong>Email:</strong> ${ticket.correo || 'No especificado'}</p>
                <p><strong>Dirección de envío:</strong> ${ticket.direccion || 'No especificada'}</p>
                <p><strong>Método de pago:</strong> ${ticket.metodoPago === 'tarjeta' ? '💳 Tarjeta' : '🅿️ PayPal'}</p>
            </div>

            <h3 style="color: #333;">🛍️ Productos</h3>
            <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                <thead>
                    <tr style="background: #ff4d6d; color: white;">
                        <th style="padding: 12px; text-align: left;">Producto</th>
                        <th style="padding: 12px; text-align: center;">Cantidad</th>
                        <th style="padding: 12px; text-align: right;">Precio</th>
                        <th style="padding: 12px; text-align: right;">Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    ${productosHTML}
                </tbody>
                <tfoot>
                    <tr style="border-top: 2px solid #ff4d6d;">
                        <td colspan="3" style="text-align: right; font-weight: bold; padding: 15px 10px;">TOTAL:</td>
                        <td style="color: #ff4d6d; font-weight: bold; font-size: 18px; padding: 15px 10px; text-align: right;">
                            $${ticket.total.toFixed(2)}
                        </td>
                    </tr>
                </tfoot>
            </table>

            <div style="margin-top: 40px; text-align: center;">
                <p style="color: #666;">📧 Hemos enviado la confirmación a tu correo</p>
                <p style="color: #666;">💄 Puedes ver tus pedidos en "Mi Perfil"</p>
                
                <div style="margin-top: 30px;">
                    <a href="index.html" 
                       style="display: inline-block; background: #ff4d6d; color: white; padding: 12px 35px; text-decoration: none; border-radius: 25px; margin: 0 10px; font-weight: bold;">
                        Seguir comprando
                    </a>
                    <a href="pedidos.html" 
                       style="display: inline-block; background: #333; color: white; padding: 12px 35px; text-decoration: none; border-radius: 25px; margin: 0 10px; font-weight: bold;">
                        Ver mis pedidos
                    </a>
                </div>
            </div>
        </div>
    `;
});