// ============================================
// REFERENCIAS A LOS FORMULARIOS
// ============================================
const loginSection = document.getElementById("login-section");
const registerSection = document.getElementById("register-section");
const toRegister = document.getElementById("to-register");
const toLogin = document.getElementById("to-login");
const btnLogin = document.getElementById("btnLogin");
const btnRegister = document.getElementById("btnRegister");
// ============================================
// VARIABLE DE CONFIGURACIÓN
// ============================================
const API_URL = 'https://luxe-api-frr5.onrender.com/api';
// ============================================
// CAMBIO ENTRE FORMULARIOS
// ============================================
toRegister.addEventListener("click", () => {
    loginSection.classList.add("hidden");
    registerSection.classList.remove("hidden");
});

toLogin.addEventListener("click", () => {
    registerSection.classList.add("hidden");
    loginSection.classList.remove("hidden");
});

// ============================================
// LOGIN
// ============================================
btnLogin.addEventListener("click", async () => {
    let correo = document.getElementById("login-correo").value;
    let contraseña = document.getElementById("login-pass").value;

    if (correo === "" || !correo.includes("@") || contraseña === "") {
        alert(" Por favor, ingresa tu correo y contraseña correctamente");
        return;
    }

       try {
        console.log('📤 Intentando conectar a:', `${API_URL}/auth/login`);
        
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ correo, contraseña })
        });


        const data = await response.json();
        console.log('📥 Respuesta:', data);

        if (response.ok) {
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));
            alert(` Bienvenido ${data.user.nombre}`);

            if (data.user.role === "admin" || data.user.role === "empleado") {
                window.location.href = "dashboard.html";
            } else {
                window.location.href = "index.html";
            }
        } else {
            alert(data.error || "Error al iniciar sesión");
        }
    } catch (error) {
        console.error('Error completo:', error);
        alert("Error de conexión con el servidor. Asegúrate de que el backend esté corriendo en https://luxe-api-frr5.onrender.com");
    }
});

// ============================================
// REGISTRO
// ============================================
btnRegister.addEventListener("click", async () => {
    const nombre = document.getElementById("reg-nombre").value;
    const telefono = document.getElementById("reg-telefono").value;
    const direccion = document.getElementById("reg-direccion").value;
    const correo = document.getElementById("reg-correo").value;
    const contraseña = document.getElementById("reg-pass").value;

    if (nombre === "" || telefono === "" || direccion === "" || !correo.includes("@") || contraseña === "") {
        alert("Por favor, llena todos los campos de tu registro Luxe");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, correo, telefono, direccion, contraseña })
        });


        const data = await response.json();

        if (response.ok) {
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));
            alert(" ¡Cuenta creada con éxito!");
            window.location.href = "index.html";
        } else {
            alert(data.error || "Error al registrarse");
        }
    } catch (error) {
        alert("Error de conexión con el servidor");
        console.error(error);
    }
});
// ============================================
// LOGIN CON GOOGLE
// ============================================
const btnGoogle = document.getElementById("btnGoogle");
if (btnGoogle) {
    btnGoogle.addEventListener("click", () => {
        window.location.href = `${API_URL}/auth/google`;
    });
}

// ============================================
// MANEJAR RETORNO DE GOOGLE
// ============================================
function handleGoogleSuccess() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const error = urlParams.get('error');

    if (error) {
        alert("Error al iniciar sesión con Google. Intenta de nuevo.");
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
    }

    if (token) {
        console.log('✅ Token recibido de Google, obteniendo usuario...');
        
        fetch(`${API_URL}/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => {
            if (!res.ok) throw new Error('Error al obtener usuario');
            return res.json();
        })
        .then(user => {
            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(user));
            
            // Limpiar URL
            window.history.replaceState({}, document.title, window.location.pathname);
            
            if (user.role === "admin" || user.role === "empleado") {
                window.location.href = "dashboard.html";
            } else {
                window.location.href = "index.html";
            }
        })
       .catch(err => {
            console.error("Error obteniendo usuario:", err);
            alert("Error al obtener datos del usuario");
            // Limpiar URL
            window.history.replaceState({}, document.title, window.location.pathname);
        });
    }
}

document.addEventListener('DOMContentLoaded', function() {
    procesarTokenGoogle();
});