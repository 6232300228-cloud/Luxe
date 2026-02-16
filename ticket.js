let ticket = JSON.parse(localStorage.getItem("ticket"));

if (!ticket) {
  document.getElementById("ticketInfo").innerHTML = "No hay ticket disponible 😥";
} else {

  let productosHTML = ticket.productos.map(p =>
    `<li>${p.nombre} x${p.cantidad} - $${(p.precio * p.cantidad).toFixed(2)}</li>`
  ).join("");

  document.getElementById("ticketInfo").innerHTML = `
    <p><b>Fecha:</b> ${ticket.fecha}</p>
    <p><b>Total:</b> $${ticket.total.toFixed(2)}</p>
    <p><b>Método de pago:</b> ${ticket.metodoPago}</p>
    <p><b>Correo:</b> ${ticket.correo}</p>

    <h3>Productos:</h3>
    <ul>${productosHTML}</ul>

    <br>
    <p>📧 Confirmación enviada a tu correo </p>
  `;
}let ticket = JSON.parse(localStorage.getItem("ticket"));

if (!ticket) {
  document.getElementById("ticketInfo").innerHTML = "No hay ticket disponible 😥";
} else {

  let productosHTML = ticket.productos.map(p =>
    `<li>${p.nombre} x${p.cantidad} - $${(p.precio * p.cantidad).toFixed(2)}</li>`
  ).join("");

  document.getElementById("ticketInfo").innerHTML = `
    <p><b>Fecha:</b> ${ticket.fecha}</p>
    <p><b>Total:</b> $${ticket.total.toFixed(2)}</p>
    <p><b>Método de pago:</b> ${ticket.metodoPago}</p>
    <p><b>Correo:</b> ${ticket.correo}</p>

    <h3>Productos:</h3>
    <ul>${productosHTML}</ul>

    <br>
    <p>📧 Confirmación enviada a tu correo </p>
  `;
}

