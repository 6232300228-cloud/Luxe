// login.js - VERSIÓN 100% CORREGIDA
const loginSection = document.getElementById("login-section");
const registerSection = document.getElementById("register-section");
const toRegister = document.getElementById("to-register");
const toLogin = document.getElementById("to-login");
const btnLogin = document.getElementById("btnLogin");
const btnRegister = document.getElementById("btnRegister");
const btnGoogle = document.getElementById("btnGoogle");

// VARIABLE DE CONFIGURACIÓN
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

// LOGIN NORMAL - CORREGIDO
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
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ correo, contraseña })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify(data.user));

                // ✅ CORREGIDO: user → data.user
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

// En la sección de REGISTRO NORMAL, actualiza la parte donde obtienes los valores:

if (btnRegister) {
    btnRegister.addEventListener("click", async () => {
        const nombre = document.getElementById("reg-nombre").value;
        const apellido = document.getElementById("reg-apellido").value;
        const telefono = document.getElementById("reg-telefono").value;
        
        // Nuevos campos de dirección
        const calle = document.getElementById("reg-calle").value;
        const numero = document.getElementById("reg-numero").value;
        const colonia = document.getElementById("reg-colonia").value;
        const estado = document.getElementById("reg-estado").value;
        const cp = document.getElementById("reg-cp").value;
        const referencia = document.getElementById("reg-referencia").value;
        
        const correo = document.getElementById("reg-correo").value;
        const contraseña = document.getElementById("reg-pass").value;

        // Combinar dirección en un solo string
        const direccionCompleta = `${calle} #${numero}, ${colonia}, ${estado}, C.P. ${cp}`;
        
        // Guardar también los campos por separado para mostrarlos bonito en perfil
        const direccionDetallada = {
            calle,
            numero,
            colonia,
            estado,
            cp,
            referencia
        };

        const nombreCompleto = `${nombre} ${apellido}`.trim();

        // Validaciones
        if (nombre === "" || apellido === "" || telefono === "" || telefono.length !== 10 || 
            calle === "" || numero === "" || colonia === "" || estado === "" || cp === "" || 
            cp.length !== 5 || !correo.includes("@") || contraseña === "") {
            
            Swal.fire({
                icon: 'error',
                title: 'Campos incompletos',
                text: 'Por favor, llena todos los campos obligatorios correctamente',
                timer: 2000,
                showConfirmButton: false,
                position: 'top-end',
                toast: true
            });
            return;
        }

        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    nombre: nombreCompleto, 
                    correo, 
                    telefono: `+52${telefono}`, // Guardamos con +52
                    direccion: direccionCompleta,
                    direccion_detallada: direccionDetallada, // Guardamos también los detalles
                    contraseña 
                })
            });

            const data = await response.json();

            if (response.ok) {
                // Guardar dirección detallada también en localStorage
                const userData = {
                    ...data.user,
                    direccion_detallada: direccionDetallada
                };
                
                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify(userData));

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

// FUNCIÓN PARA LOGIN CON TOKEN - CORREGIDA
async function loginConToken(token) {
    try {
        console.log('Intentando login con token');

        const response = await fetch(`${API_URL}/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error('Error al obtener usuario');
        }

        const user = await response.json();

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        // ✅ user SÍ existe aquí (es el resultado del fetch)
        const primerNombre = getPrimerNombre(user.nombre);

        console.log('Usuario autenticado:', user.nombre);

        Swal.fire({
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

// PROCESAR TOKEN DE GOOGLE
(function() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (token) {
        console.log('Token detectado en URL, procesando...');
        loginConToken(token);
    }
})();

// Suscripción newsletter
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