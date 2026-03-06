// Obtenemos el usuario que ya inició sesión desde el localStorage
let user = JSON.parse(localStorage.getItem("user"));

// Verificación de sesión: si no hay usuario, redirige al login
if (!user) {
    alert(" No has iniciado sesión");
    window.location.href = "login.html";
} else {
    // Referencias a los elementos del HTML (asegúrate de que los IDs coincidan en perfil.html)
    const nombreInput = document.getElementById("perfilNombreInput");
    const correoInput = document.getElementById("perfilCorreoInput");
    const telefonoInput = document.getElementById("perfilTelefonoInput");
    const direccionInput = document.getElementById("perfilDireccionInput");
    const tarjetaInput = document.getElementById("perfilTarjetaInput");
    const btnGuardar = document.getElementById("btnGuardar");

    // --- MOSTRAR DATOS AL CARGAR LA PÁGINA ---
    // Rellenamos los campos con la información que el usuario puso al registrarse
    nombreInput.value = user.nombre || "";
    correoInput.value = user.correo || "";
    telefonoInput.value = user.telefono || "";
    
    // Aquí es donde ocurre la magia: mostramos la dirección capturada en el registro o perfil
    direccionInput.value = user.direccion || "";
    tarjetaInput.value = user.tarjeta || "";

    // --- FUNCIÓN PARA GUARDAR LOS CAMBIOS ---
    btnGuardar.onclick = () => {
        // Validación de campos obligatorios para mantener la integridad de la cuenta
        if (nombreInput.value.trim() === "" || correoInput.value.trim() === "") {
            alert(" El nombre y el correo electrónico son obligatorios");
            return;
        }

        // Actualizamos el objeto 'user' con la nueva información de los cuadros de texto
        user.nombre = nombreInput.value;
        user.correo = correoInput.value;
        user.telefono = telefonoInput.value;
        user.direccion = direccionInput.value; // Guardamos la dirección actualizada
        user.tarjeta = tarjetaInput.value; // Guardamos el método de pago

        // Guardamos la versión actualizada en la memoria del navegador (localStorage)
        localStorage.setItem("user", JSON.stringify(user));
        
        alert(" ¡Tus datos de Luxe Maquillaje se han actualizado! ");
        
        // Recargamos la página para que los cambios se reflejen en toda la interfaz (como el saludo en el header)
        window.location.reload();
    };
}