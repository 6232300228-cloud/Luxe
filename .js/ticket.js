// ticket.js
document.addEventListener("DOMContentLoaded", () => {
    const ticket = JSON.parse(localStorage.getItem("ticket"));
    const contenedor = document.getElementById("ticketInfo");

    if (!ticket) {
        contenedor.innerHTML = "❌ No hay información del ticket";
        return;
    }

    const productosHTML = ticket.productos.map(p => `
        <tr>
            <td>${p.nombre}</td>
            <td>${p.cantidad}</td>
            <td>$${p.precio.toFixed(2)}</td>
            <td>$${(p.precio * p.cantidad).toFixed(2)}</td>
        </tr>
    `).join("");

    contenedor.innerHTML = `
        <div style="background: white; padding: 30px; border-radius: 15px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #ff4d6d;">🎉 ¡Gracias por tu compra!</h2>
            
            <div style="text-align: left; margin-top: 20px; background: #f9f9f9; padding: 20px; border-radius: 10px;">
                <p><strong>Pedido #:</strong> ${ticket.id || 'Nuevo'}</p>
                <p><strong>Fecha:</strong> ${ticket.fecha}</p>
                <p><strong>Cliente:</strong> ${ticket.cliente}</p>
                <p><strong>Email:</strong> ${ticket.correo}</p>
                <p><strong>Dirección:</strong> ${ticket.direccion}</p>
                <p><strong>Método de pago:</strong> ${ticket.metodoPago}</p>
            </div>

            <h3 style="margin-top: 30px; color: #333;">Productos</h3>
            <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                <thead>
                    <tr style="background: #ff4d6d; color: white;">
                        <th style="padding: 10px; text-align: left;">Producto</th>
                        <th style="padding: 10px; text-align: center;">Cantidad</th>
                        <th style="padding: 10px; text-align: right;">Precio</th>
                        <th style="padding: 10px; text-align: right;">Subtotal</th>
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
                    <a href="index.html" style="display: inline-block; background: #ff4d6d; color: white; padding: 12px 35px; text-decoration: none; border-radius: 25px; margin: 0 10px; font-weight: bold;">
                        Seguir comprando
                    </a>
                    <a href="pedidos.html" style="display: inline-block; background: #333; color: white; padding: 12px 35px; text-decoration: none; border-radius: 25px; margin: 0 10px; font-weight: bold;">
                        Ver mis pedidos
                    </a>
                </div>
            </div>
        </div>
    `;
});