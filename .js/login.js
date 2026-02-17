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

/* LOGIN */
btnLogin.addEventListener("click", () => {
    let nombre = document.getElementById("usuario").value;
    let correo = document.getElementById("correo").value;

    if (nombre === "" || !correo.includes("@")) {
        alert("⚠️ Completa los datos correctamente");
        return;
    }

    // --- NUEVA LÓGICA DE ROLES ---
    let rol = "cliente"; // Por defecto es cliente

    // Simulamos usuarios especiales para el profesor:
    // Si el nombre de usuario es "admin", será Administrador
    // Si el nombre de usuario es "empleado", será Empleado
   if (correo === "admin@luxe.com") {
        rol = "admin";
    } else if (correo === "staff@luxe.com") {
        rol = "empleado";
    }
    // Guardamos el objeto con el ROL incluido
    const datosSesion = {
        nombre: nombre,
        correo: correo,
        rol: rol
    };
    localStorage.setItem("user", JSON.stringify(datosSesion));
    localStorage.setItem("usuarioActual", JSON.stringify(datosSesion));

    alert(`✅ Bienvenida, ${nombre}`);

    // --- REDIRECCIÓN INTELIGENTE ---
    if (rol === "admin" || rol === "empleado") {
        // Si es personal de la tienda, va al Dashboard
        window.location.href = "dashboard.html";
    } else {
        // Si es un cliente normal, va a la tienda
        window.location.href = "index.html";
    }
});

/* REGISTRO */
btnRegister.addEventListener("click", () => {

    const nombre = document.getElementById("reg-nombre").value;
    const correo = document.getElementById("reg-correo").value;
    const telefono = document.getElementById("reg-telefono").value;

    if (nombre === "" || telefono === "" || !correo.includes("@")) {
        alert("⚠️ Llena todos los campos");
        return;
    }

    localStorage.setItem("user", JSON.stringify({
        nombre,
        correo,
        telefono,
        rol: "cliente"
    }));

    alert("Cuenta creada correctamente");
    window.location.href = "index.html";
});
