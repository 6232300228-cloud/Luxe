const loginSection = document.getElementById("login-section");
const registerSection = document.getElementById("register-section");
const toRegister = document.getElementById("to-register");
const toLogin = document.getElementById("to-login");

const btnLogin = document.getElementById("btnLogin");
const btnRegister = document.getElementById("btnRegister");

/* CAMBIO ENTRE FORMULARIOS */
toRegister.addEventListener("click", () => {
    loginSection.classList.add("hidden");
    registerSection.classList.remove("hidden");
});

toLogin.addEventListener("click", () => {
    registerSection.classList.add("hidden");
    loginSection.classList.remove("hidden");
});

/* LOGIN (Sincronizado con Correo y Contraseña) */
btnLogin.addEventListener("click", () => {
    // Cambiamos 'usuario' por los nuevos campos de correo y pass
    let correo = document.getElementById("login-correo").value;
    let pass = document.getElementById("login-pass").value;

    if (correo === "" || !correo.includes("@") || pass === "") {
        alert("⚠️ Por favor, ingresa tu correo y contraseña correctamente");
        return;
    }

    // --- LÓGICA DE ROLES PROFESIONAL ---
    let rol = "cliente"; 

    if (correo === "admin@luxe.com" && pass === "admin123") {
        rol = "admin";
    } else if (correo === "staff@luxe.com" && pass === "staff123") {
        rol = "empleado";
    }

    // Guardamos los datos simulando una sesión real
    const datosSesion = {
        correo: correo,
        rol: rol,
        nombre: rol === "admin" ? "Administrador" : "Cliente Luxe" 
    };

    localStorage.setItem("user", JSON.stringify(datosSesion));
    localStorage.setItem("usuarioActual", JSON.stringify(datosSesion));

    alert(`✅ Acceso concedido como: ${rol.toUpperCase()}`);

    // REDIRECCIÓN
    if (rol === "admin" || rol === "empleado") {
        window.location.href = "dashboard.html";
    } else {
        window.location.href = "index.html";
    }
});

/* REGISTRO (Incluye Dirección para el Perfil) */
btnRegister.addEventListener("click", () => {
    const nombre = document.getElementById("reg-nombre").value;
    const telefono = document.getElementById("reg-telefono").value;
    const direccion = document.getElementById("reg-direccion").value; // Captura dirección
    const correo = document.getElementById("reg-correo").value;
    const pass = document.getElementById("reg-pass").value;

    if (nombre === "" || telefono === "" || direccion === "" || !correo.includes("@") || pass === "") {
        alert("⚠️ Por favor, llena todos los campos de tu registro Luxe");
        return;
    }
    // Guardamos el objeto COMPLETO. 
    // Ahora 'direccion' viajará a tu base de datos o perfil automáticamente.
const nuevoUsuario = {
        nombre,
        telefono,
        direccion,
        correo,
        pass,
        rol: "cliente"
    };

    localStorage.setItem("user", JSON.stringify(nuevoUsuario));
    alert("✨ ¡Cuenta creada con éxito!");
    window.location.href = "index.html";
});