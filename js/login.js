// login.js - VERSIÓN FINAL 100% FUNCIONAL
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
    toRegister.addEventListener("click", (e) => {
        e.preventDefault();
        loginSection.classList.add("hidden");
        registerSection.classList.remove("hidden");
    });
}

if (toLogin) {
    toLogin.addEventListener("click", (e) => {
        e.preventDefault();
        registerSection.classList.add("hidden");
        loginSection.classList.remove("hidden");
    });
}

// ============================================
// LOGIN NORMAL
// ============================================
if (btnLogin) {
    btnLogin.addEventListener("click", async () => {
        const correo = document.getElementById("login-correo").value.trim();
        const contraseña = document.getElementById("login-pass").value;

        if (!correo || !correo.includes("@") || !contraseña) {
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

        Swal.fire({
            title: 'Iniciando sesión...',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ correo, contraseña })
            });

            const data = await response.json();
            Swal.close();

            if (response.ok) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify(data.user));

                const primerNombre = getPrimerNombre(data.user.nombre);

                await Swal.fire({
                    icon: 'success',
                    title: `¡Bienvenido ${primerNombre}!`,
                    timer: 1500,
                    showConfirmButton: false,
                    position: 'top-end',
                    toast: true
                });

                if (data.user.role === "admin" || data.user.role === "empleado") {
                    window.location.href = "dashboard.html";
                } else {
                    window.location.href = "index.html";
                }
                
            } else {
                if (data.tipo === 'google_account') {
                    const result = await Swal.fire({
                        icon: 'info',
                        title: 'Cuenta de Google',
                        html: `<p>${data.error}</p><p>¿Quieres iniciar sesión con Google?</p>`,
                        showCancelButton: true,
                        confirmButtonText: 'Iniciar con Google',
                        cancelButtonText: 'Cancelar',
                        confirmButtonColor: '#ff4d6d'
                    });
                    
                    if (result.isConfirmed) {
                        window.location.href = `${API_URL}/auth/google`;
                    }
                    
                } else if (data.tipo === 'not_verified') {
                    const result = await Swal.fire({
                        icon: 'warning',
                        title: 'Email no verificado',
                        html: `<p>${data.error}</p><p>Revisa tu bandeja de entrada.</p>`,
                        showCancelButton: true,
                        confirmButtonText: 'Reenviar correo',
                        cancelButtonText: 'Cerrar',
                        confirmButtonColor: '#ff4d6d'
                    });
                    
                    if (result.isConfirmed) {
                        await reenviarVerificacion(data.correo);
                    }
                    
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
            }
        } catch (error) {
            console.error('Error:', error);
            Swal.close();
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

// ============================================
// 🟢 FUNCIÓN REENVIAR VERIFICACIÓN - CORREGIDA 🟢
// ============================================
async function reenviarVerificacion(correo) {
    try {
        // Mostrar loading
        const loadingSwal = Swal.fire({
            title: 'Enviando correo...',
            text: 'Por favor espera',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        const response = await fetch(`${API_URL}/auth/resend-verification`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ correo })
        });

        const data = await response.json();
        
        // 🟢 CERRAR LOADING ANTES DE MOSTRAR RESULTADO
        Swal.close();

        if (response.ok) {
            Swal.fire({
                icon: 'success',
                title: '¡Correo enviado!',
                text: 'Revisa tu bandeja de entrada',
                timer: 2000,
                showConfirmButton: false,
                position: 'top-end',
                toast: true
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: data.error || 'No se pudo reenviar el correo',
                timer: 2000,
                showConfirmButton: false,
                position: 'top-end',
                toast: true
            });
        }
    } catch (error) {
        console.error('Error:', error);
        // 🟢 CERRAR LOADING EN CASO DE ERROR
        Swal.close();
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
}

// ============================================
// REGISTRO NORMAL
// ============================================
if (btnRegister) {
    btnRegister.addEventListener("click", async () => {
        const nombre = document.getElementById("reg-nombre").value.trim();
        const apellido = document.getElementById("reg-apellido").value.trim();
        const telefono = document.getElementById("reg-telefono").value.trim();
        const direccion = document.getElementById("reg-direccion").value.trim();
        const correo = document.getElementById("reg-correo").value.trim();
        const contraseña = document.getElementById("reg-pass").value;

        const nombreCompleto = `${nombre} ${apellido}`.trim();

        if (!nombre || !apellido || !telefono || !direccion || !correo.includes("@") || !contraseña) {
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

        if (contraseña.length < 6) {
            Swal.fire({
                icon: 'error',
                title: 'Contraseña muy corta',
                text: 'La contraseña debe tener al menos 6 caracteres',
                timer: 2000,
                showConfirmButton: false,
                position: 'top-end',
                toast: true
            });
            return;
        }

        Swal.fire({
            title: 'Creando cuenta...',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    nombre: nombreCompleto, 
                    correo, 
                    telefono, 
                    direccion, 
                    contraseña 
                })
            });

            const data = await response.json();
            Swal.close();

            if (response.ok) {
                localStorage.setItem("pendingUser", JSON.stringify(data.user));

                await Swal.fire({
                    icon: 'success',
                    title: '¡Cuenta creada!',
                    html: `
                        <p>Te hemos enviado un correo de verificación a:</p>
                        <strong>${correo}</strong>
                        <p style="margin-top: 15px;">Revisa tu bandeja de entrada</p>
                    `,
                    confirmButtonText: 'Entendido',
                    confirmButtonColor: '#ff4d6d'
                });

                // Limpiar formulario
                document.getElementById("reg-nombre").value = '';
                document.getElementById("reg-apellido").value = '';
                document.getElementById("reg-telefono").value = '';
                document.getElementById("reg-direccion").value = '';
                document.getElementById("reg-correo").value = '';
                document.getElementById("reg-pass").value = '';
                
                registerSection.classList.add("hidden");
                loginSection.classList.remove("hidden");
                
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
            Swal.close();
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

// ============================================
// LOGIN CON GOOGLE
// ============================================
if (btnGoogle) {
    btnGoogle.addEventListener("click", () => {
        window.location.href = `${API_URL}/auth/google`;
    });
}

// ============================================
// LOGIN CON TOKEN (Google Callback)
// ============================================
async function loginConToken(token) {
    try {
        console.log('🔄 Procesando token de Google...');

        Swal.fire({
            title: 'Completando login...',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        const response = await fetch(`${API_URL}/auth/me`, {
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Error al obtener usuario');
        }

        const user = await response.json();
        Swal.close();

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        const primerNombre = getPrimerNombre(user.nombre);

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
        console.error('❌ Error:', error);
        Swal.close();
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Error al iniciar sesión con Google',
            timer: 2000,
            showConfirmButton: false,
            position: 'top-end',
            toast: true
        });
    }
}

// ============================================
// PROCESAR TOKEN DE GOOGLE
// ============================================
(function() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const error = urlParams.get('error');

    if (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error con Google',
            text: 'No se pudo iniciar sesión con Google',
            timer: 2000,
            showConfirmButton: false,
            position: 'top-end',
            toast: true
        });
    }

    if (token) {
        console.log('✅ Token detectado');
        window.history.replaceState({}, document.title, window.location.pathname);
        loginConToken(token);
    }
})();

// ============================================
// VERIFICAR USUARIO PENDIENTE
// ============================================
(function() {
    const pendingUser = localStorage.getItem("pendingUser");
    if (pendingUser) {
        const user = JSON.parse(pendingUser);
        Swal.fire({
            icon: 'info',
            title: 'Verifica tu email',
            html: `
                <p>Enviamos un correo a:</p>
                <strong>${user.correo}</strong>
                <p>Verifícalo para iniciar sesión</p>
            `,
            confirmButtonText: 'Entendido',
            confirmButtonColor: '#ff4d6d'
        });
        localStorage.removeItem("pendingUser");
    }
})();

// SUSCRIPCIÓN NEWSLETTER
function suscribirse() {
    const email = document.getElementById('newsletter-email').value.trim();
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
            timer: 1500,
            showConfirmButton: false,
            position: 'top-end',
            toast: true
        });
    }
}