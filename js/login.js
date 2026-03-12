// login.js - Versión para producción (con manejo de CORS)

const loginSection = document.getElementById("login-section");
const registerSection = document.getElementById("register-section");
const toRegister = document.getElementById("to-register");
const toLogin = document.getElementById("to-login");
const btnLogin = document.getElementById("btnLogin");
const btnRegister = document.getElementById("btnRegister");
const btnGoogle = document.getElementById("btnGoogle");

// VARIABLE DE CONFIGURACIÓN - DETECCIÓN AUTOMÁTICA DE ENTORNO
const API_URL = 'https://luxe-api-frr5.onrender.com/api';

// FUNCIÓN PARA OBTENER EL PRIMER NOMBRE
function getPrimerNombre(nombreCompleto) {
    if (!nombreCompleto) return 'Usuario';
    return nombreCompleto.split(' ')[0];
}

// CAMBIO ENTRE FORMULARIOS
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

// FUNCIÓN PARA HACER FETCH CON SOPORTE CORS
async function fetchConCORS(url, options = {}) {
    const defaultOptions = {
        mode: 'cors',
        credentials: 'omit',
        headers: {
            'Content-Type': 'application/json',
        }
    };
    
    const fetchOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    };
    
    try {
        const response = await fetch(url, fetchOptions);
        return response;
    } catch (error) {
        console.error('Error de fetch:', error);
        throw error;
    }
}

// LOGIN NORMAL
if (btnLogin) {
    btnLogin.addEventListener("click", async () => {
        let correo = document.getElementById("login-correo").value;
        let contraseña = document.getElementById("login-pass").value;

        if (correo === "" || !correo.includes("@") || contraseña === "") {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Por favor, ingresa tu correo y contraseña correctamente',
                timer: 2000,
                showConfirmButton: false,
                position: 'top-end',
                toast: true
            });
            return;
        }

        try {
            console.log('Intentando login con:', correo);
            
            const response = await fetchConCORS(`${API_URL}/auth/login`, {
                method: 'POST',
                body: JSON.stringify({ correo, contraseña })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify(data.user));

                const primerNombre = getPrimerNombre(data.user.nombre);

                Swal.fire({
                    icon: 'success',
                    title: `¡Bienvenido ${primerNombre}!`,
                    timer: 1500,
                    showConfirmButton: false,
                    position: 'top-end',
                    toast: true,
                    didClose: () => {
                        if (data.user.role === "admin" || data.user.role === "empleado") {
                            window.location.href = "dashboard.html";
                        } else {
                            window.location.href = "index.html";
                        }
                    }
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: data.error || "Error al iniciar sesión",
                    timer: 2000,
                    showConfirmButton: false,
                    position: 'top-end',
                    toast: true
                });
            }
        } catch (error) {
            console.error('Error completo:', error);
            
            // Mensaje más específico según el error
            let mensajeError = 'No se pudo conectar con el servidor';
            
            if (error.message.includes('Failed to fetch')) {
                mensajeError = 'Error de CORS o servidor no disponible';
            }
            
            Swal.fire({
                icon: 'error',
                title: 'Error de conexión',
                text: mensajeError,
                timer: 3000,
                showConfirmButton: true,
                confirmButtonColor: '#ff4d6d',
                position: 'center'
            });
        }
    });
}

// REGISTRO NORMAL
if (btnRegister) {
    btnRegister.addEventListener("click", async () => {
        const nombre = document.getElementById("reg-nombre").value;
        const apellido = document.getElementById("reg-apellido").value;
        const telefono = document.getElementById("reg-telefono").value;
        const direccion = document.getElementById("reg-direccion").value;
        const correo = document.getElementById("reg-correo").value;
        const contraseña = document.getElementById("reg-pass").value;

        const nombreCompleto = `${nombre} ${apellido}`.trim();

        if (nombre === "" || apellido === "" || telefono === "" || direccion === "" || !correo.includes("@") || contraseña === "") {
            Swal.fire({
                icon: 'error',
                title: 'Campos incompletos',
                text: 'Por favor, llena todos los campos',
                timer: 2000,
                showConfirmButton: false,
                position: 'top-end',
                toast: true
            });
            return;
        }

        try {
            const response = await fetchConCORS(`${API_URL}/auth/register`, {
                method: 'POST',
                body: JSON.stringify({ 
                    nombre: nombreCompleto, 
                    correo, 
                    telefono, 
                    direccion, 
                    contraseña 
                })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify(data.user));

                const primerNombre = getPrimerNombre(data.user.nombre);

                Swal.fire({
                    icon: 'success',
                    title: `¡Cuenta creada! Bienvenido ${primerNombre}!`,
                    timer: 1500,
                    showConfirmButton: false,
                    position: 'top-end',
                    toast: true,
                    didClose: () => {
                        window.location.href = "index.html";
                    }
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: data.error || "Error al registrarse",
                    timer: 2000,
                    showConfirmButton: false,
                    position: 'top-end',
                    toast: true
                });
            }
        } catch (error) {
            console.error('Error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error de conexión',
                text: 'No se pudo conectar con el servidor',
                timer: 2000,
                showConfirmButton: false,
                position: 'top-end',
                toast: true
            });
        }
    });
}

// LOGIN CON GOOGLE
if (btnGoogle) {
    btnGoogle.addEventListener("click", () => {
        window.location.href = `${API_URL}/auth/google`;
    });
}

// FUNCIÓN PARA LOGIN CON TOKEN (Google callback)
async function loginConToken(token) {
    try {
        console.log('Intentando login con token');

        const response = await fetchConCORS(`${API_URL}/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error('Error al obtener usuario');
        }

        const user = await response.json();

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        const primerNombre = getPrimerNombre(user.nombre);

        console.log('Usuario autenticado:', user.nombre);

        await Swal.fire({
            icon: 'success',
            title: `¡Bienvenido ${primerNombre}!`,
            timer: 1500,
            showConfirmButton: false,
            position: 'top-end',
            toast: true
        });

        if (user.role === "admin" || user.role === "empleado") {
            window.location.href = "dashboard.html";
        } else {
            window.location.href = "index.html";
        }
    } catch (error) {
        console.error('Error en login con token:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Error al iniciar sesión automáticamente',
            timer: 2000,
            showConfirmButton: false,
            position: 'top-end',
            toast: true
        });
    }
}

// PROCESAR TOKEN DE GOOGLE AL CARGAR LA PÁGINA
(function() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (token) {
        console.log('Token detectado en URL, procesando...');
        loginConToken(token);
    } else {
        console.log('No hay token en URL');
    }
})();

// Función para newsletter
function suscribirse() {
    const email = document.getElementById('newsletter-email').value;
    if (email && email.includes('@')) {
        Swal.fire({
            icon: 'success',
            title: '¡Gracias por suscribirte!',
            timer: 1500,
            showConfirmButton: false,
            position: 'top-end',
            toast: true
        });
        document.getElementById('newsletter-email').value = '';
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Email inválido',
            text: 'Por favor ingresa un email válido',
            timer: 1500,
            showConfirmButton: false,
            position: 'top-end',
            toast: true
        });
    }
}