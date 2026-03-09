// ============================================
// REFERENCIAS A LOS FORMULARIOS
// ============================================
const loginSection = document.getElementById("login-section");
const registerSection = document.getElementById("register-section");
const toRegister = document.getElementById("to-register");
const toLogin = document.getElementById("to-login");
const btnLogin = document.getElementById("btnLogin");
const btnRegister = document.getElementById("btnRegister");
const btnGoogle = document.getElementById("btnGoogle");

// ============================================
// VARIABLE DE CONFIGURACIÓN
// ============================================
const API_URL = 'https://luxe-api-frr5.onrender.com/api';

// ============================================
// CAMBIO ENTRE FORMULARIOS
// ============================================
if (toRegister) {
    toRegister.addEventListener("click", () => {
        loginSection.classList.add("hidden");
        registerSection.classList.remove("hidden");
    });
}

if (toLogin) {
    toLogin.addEventListener("click", () => {
        registerSection.classList.add("hidden");
        loginSection.classList.remove("hidden");
    });
}

// ============================================
// LOGIN NORMAL
// ============================================
if (btnLogin) {
    btnLogin.addEventListener("click", async () => {
        let correo = document.getElementById("login-correo").value;
        let contraseña = document.getElementById("login-pass").value;

        if (correo === "" || !correo.includes("@") || contraseña === "") {
            alert(" Por favor, ingresa tu correo y contraseña correctamente");
            return;
        }

        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ correo, contraseña })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify(data.user));
                
                if (data.user.role === "admin" || data.user.role === "empleado") {
                    window.location.href = "dashboard.html";
                } else {
                    window.location.href = "index.html";
                }
            } else {
                alert(data.error || "Error al iniciar sesión");
            }
        } catch (error) {
            console.error('Error:', error);
            alert("Error de conexión con el servidor");
        }
    });
}

// ============================================
// REGISTRO NORMAL
// ============================================
if (btnRegister) {
    btnRegister.addEventListener("click", async () => {
        const nombre = document.getElementById("reg-nombre").value;
        const telefono = document.getElementById("reg-telefono").value;
        const direccion = document.getElementById("reg-direccion").value;
        const correo = document.getElementById("reg-correo").value;
        const contraseña = document.getElementById("reg-pass").value;

        if (nombre === "" || telefono === "" || direccion === "" || !correo.includes("@") || contraseña === "") {
            alert("⚠️ Por favor, llena todos los campos");
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
}

// ============================================
// LOGIN CON GOOGLE
// ============================================
if (btnGoogle) {
    btnGoogle.addEventListener("click", () => {
        window.location.href = `${API_URL}/auth/google`;
    });
}

// ============================================
// FUNCIÓN PARA INICIAR SESIÓN CON TOKEN
// ============================================
async function loginConToken(token) {
    try {
        console.log('🔑 Intentando login con token');
        
        const response = await fetch(`${API_URL}/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error('Error al obtener usuario');
        }

        const user = await response.json();
        
        // Guardar en localStorage
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        
        console.log('✅ Usuario autenticado:', user.nombre);
        
        // Redirigir según rol
        if (user.role === "admin" || user.role === "empleado") {
            window.location.href = "dashboard.html";
        } else {
            window.location.href = "index.html";
        }
    } catch (error) {
        console.error('❌ Error en login con token:', error);
        alert("Error al iniciar sesión automáticamente");
    }
}

// ============================================
// PROCESAR TOKEN DE GOOGLE AL CARGAR LA PÁGINA
// ============================================
(function() {
    // Obtener token de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (token) {
        console.log('🎯 Token detectado en URL, procesando...');
        loginConToken(token);
    } else {
        console.log('👀 No hay token en URL');
    }
})();