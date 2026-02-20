const loginSection = document.getElementById("login-section");
const registerSection = document.getElementById("register-section");
const toRegister = document.getElementById("to-register");
const toLogin = document.getElementById("to-login");

const btnLogin = document.getElementById("btnLogin");
const btnRegister = document.getElementById("btnRegister");

// CAMBIO ENTRE FORMULARIOS
toRegister.addEventListener("click", () => {
    loginSection.classList.add("hidden");
    registerSection.classList.remove("hidden");
});

toLogin.addEventListener("click", () => {
    registerSection.classList.add("hidden");
    loginSection.classList.remove("hidden");
});

// LOGIN (Conectado a MongoDB)
btnLogin.addEventListener("click", async () => {
    let correo = document.getElementById("login-correo").value;
    let pass = document.getElementById("login-pass").value;

    if (correo === "" || !correo.includes("@") || pass === "") {
        alert("⚠️ Por favor, ingresa tu correo y contraseña correctamente");
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ correo, contraseña: pass }) // Nota: 'contraseña' en backend
        });

        const data = await response.json();

        if (response.ok) {
            // Guardar token y datos en localStorage
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));

            alert(`✅ Bienvenido ${data.user.nombre}`);

            // Redirección por rol
            if (data.user.role === "admin" || data.user.role === "empleado") {
                window.location.href = "dashboard.html";
            } else {
                window.location.href = "index.html";
            }
        } else {
            alert(data.error || "Error al iniciar sesión");
        }
    } catch (error) {
        alert("Error de conexión con el servidor");
        console.error(error);
    }
});

// REGISTRO (Conectado a MongoDB)
btnRegister.addEventListener("click", async () => {
    const nombre = document.getElementById("reg-nombre").value;
    const telefono = document.getElementById("reg-telefono").value;
    const direccion = document.getElementById("reg-direccion").value;
    const correo = document.getElementById("reg-correo").value;
    const pass = document.getElementById("reg-pass").value;

    if (nombre === "" || telefono === "" || direccion === "" || !correo.includes("@") || pass === "") {
        alert("⚠️ Por favor, llena todos los campos de tu registro Luxe");
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                nombre, 
                correo, 
                telefono, 
                direccion,
                contraseña: pass 
            })
        });

        const data = await response.json();

        if (response.ok) {
            // Guardar token y datos
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));
            
            alert("✨ ¡Cuenta creada con éxito!");
            window.location.href = "index.html";
        } else {
            alert(data.error || "Error al registrarse");
        }
    } catch (error) {
        alert("Error de conexión con el servidor");
        console.error(error);
    }
});