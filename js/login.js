// login.js - VERSIÓN CORREGIDA CON MEJOR MANEJO DE ERRORES
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

// FUNCIÓN PARA MOSTRAR TOAST CON SWEETALERT
function mostrarToast(mensaje, tipo = 'error') {
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            icon: tipo,
            title: mensaje,
            timer: 2000,
            showConfirmButton: false,
            position: 'top-end',
            toast: true
        });
    } else {
        alert(mensaje);
    }
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

// LOGIN NORMAL
if (btnLogin) {
    btnLogin.addEventListener("click", async () => {
        let correo = document.getElementById("login-correo").value;
        let contraseña = document.getElementById("login-pass").value;

        if (correo === "" || !correo.includes("@") || contraseña === "") {
            mostrarToast('Por favor, ingresa tu correo y contraseña correctamente', 'error');
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
                // Manejar caso de cuenta no verificada
                if (data.tipo === 'not_verified') {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Cuenta no verificada',
                        text: 'Por favor verifica tu correo electrónico antes de iniciar sesión',
                        confirmButtonText: 'Reenviar correo',
                        showCancelButton: true,
                        cancelButtonText: 'Cancelar'
                    }).then(async (result) => {
                        if (result.isConfirmed) {
                            try {
                                const resendRes = await fetch(`${API_URL}/auth/resend-verification`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ correo })
                                });
                                if (resendRes.ok) {
                                    mostrarToast('Correo de verificación reenviado', 'success');
                                } else {
                                    mostrarToast('Error al reenviar el correo');
                                }
                            } catch (error) {
                                mostrarToast('Error de conexión');
                            }
                        }
                    });
                } else {
                    mostrarToast(data.error || "Error al iniciar sesión", 'error');
                }
            }
        } catch (error) {
            console.error('Error:', error);
            mostrarToast('No se pudo conectar con el servidor', 'error');
        }
    });
}

// REGISTRO - VERSIÓN CORREGIDA
if (btnRegister) {
    btnRegister.addEventListener("click", async () => {
        // Obtener valores
        const nombre = document.getElementById("reg-nombre").value.trim();
        const apellido = document.getElementById("reg-apellido").value.trim();
        const telefono = document.getElementById("reg-telefono").value.trim();
        
        // Campos de dirección
        const calle = document.getElementById("reg-calle").value.trim();
        const numero = document.getElementById("reg-numero").value.trim();
        const colonia = document.getElementById("reg-colonia").value.trim();
        const estado = document.getElementById("reg-estado").value.trim();
        const cp = document.getElementById("reg-cp").value.trim();
        const referencia = document.getElementById("reg-referencia").value.trim();
        
        const correo = document.getElementById("reg-correo").value.trim();
        const contraseña = document.getElementById("reg-pass").value;

        // ============================================
        // VALIDACIONES DETALLADAS CON MENSAJES CLAROS
        // ============================================
        
        // Validar nombre y apellido
        if (nombre === "") {
            mostrarToast('Por favor ingresa tu nombre', 'error');
            document.getElementById("reg-nombre").focus();
            return;
        }
        
        if (apellido === "") {
            mostrarToast('Por favor ingresa tu apellido', 'error');
            document.getElementById("reg-apellido").focus();
            return;
        }
        
        // Validar teléfono (10 dígitos, solo números)
        if (telefono === "") {
            mostrarToast('Por favor ingresa tu teléfono', 'error');
            document.getElementById("reg-telefono").focus();
            return;
        }
        
        if (!/^\d{10}$/.test(telefono)) {
            mostrarToast('El teléfono debe tener exactamente 10 dígitos (solo números)', 'error');
            document.getElementById("reg-telefono").focus();
            return;
        }
        
        // Validar dirección
        if (calle === "") {
            mostrarToast('Por favor ingresa tu calle', 'error');
            document.getElementById("reg-calle").focus();
            return;
        }
        
        if (numero === "") {
            mostrarToast('Por favor ingresa el número exterior', 'error');
            document.getElementById("reg-numero").focus();
            return;
        }
        
        if (colonia === "") {
            mostrarToast('Por favor ingresa tu colonia', 'error');
            document.getElementById("reg-colonia").focus();
            return;
        }
        
        if (estado === "") {
            mostrarToast('Por favor ingresa tu estado', 'error');
            document.getElementById("reg-estado").focus();
            return;
        }
        
        if (cp === "") {
            mostrarToast('Por favor ingresa tu código postal', 'error');
            document.getElementById("reg-cp").focus();
            return;
        }
        
        if (!/^\d{5}$/.test(cp)) {
            mostrarToast('El código postal debe tener exactamente 5 dígitos', 'error');
            document.getElementById("reg-cp").focus();
            return;
        }
        
        // Validar correo
        if (correo === "") {
            mostrarToast('Por favor ingresa tu correo electrónico', 'error');
            document.getElementById("reg-correo").focus();
            return;
        }
        
        if (!correo.includes("@") || !correo.includes(".")) {
            mostrarToast('Por favor ingresa un correo electrónico válido', 'error');
            document.getElementById("reg-correo").focus();
            return;
        }
        
        // Validar contraseña
        if (contraseña === "") {
            mostrarToast('Por favor ingresa una contraseña', 'error');
            document.getElementById("reg-pass").focus();
            return;
        }
        
        if (contraseña.length < 6) {
            mostrarToast('La contraseña debe tener al menos 6 caracteres', 'error');
            document.getElementById("reg-pass").focus();
            return;
        }

        // Mostrar loading
        btnRegister.disabled = true;
        btnRegister.textContent = 'Registrando...';

        // Construir dirección completa
        const direccionCompleta = `${calle} #${numero}, ${colonia}, ${estado}, C.P. ${cp}`;
        
        // Dirección detallada para guardar en el perfil
        const direccionDetallada = {
            calle,
            numero,
            colonia,
            estado,
            cp,
            referencia: referencia || ''
        };

        const nombreCompleto = `${nombre} ${apellido}`.trim();

        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    nombre: nombreCompleto, 
                    correo, 
                    telefono: `+52${telefono}`,
                    direccion: direccionCompleta,
                    direccion_detallada: direccionDetallada,
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
                    title: `¡Cuenta creada!`,
                    html: `Hola <strong>${primerNombre}</strong>,<br>Te hemos enviado un correo de verificación a <strong>${correo}</strong><br>Por favor revisa tu bandeja de entrada.`,
                    confirmButtonText: 'Entendido',
                    confirmButtonColor: '#ff4d6d'
                }).then(() => {
                    window.location.href = "login.html";
                });
            } else {
                mostrarToast(data.error || "Error al registrarse", 'error');
                btnRegister.disabled = false;
                btnRegister.textContent = 'Registrarme';
            }
        } catch (error) {
            console.error('Error:', error);
            mostrarToast('No se pudo conectar con el servidor. Verifica tu conexión a internet.', 'error');
            btnRegister.disabled = false;
            btnRegister.textContent = 'Registrarme';
        }
    });
}

// LOGIN CON GOOGLE
if (btnGoogle) {
    btnGoogle.addEventListener("click", () => {
        window.location.href = `${API_URL}/auth/google`;
    });
}

// FUNCIÓN PARA LOGIN CON TOKEN
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

        const primerNombre = getPrimerNombre(user.nombre);

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
        mostrarToast('Error al iniciar sesión automáticamente', 'error');
    }
}

// PROCESAR TOKEN DE GOOGLE
(function() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (token) {
        console.log('Token detectado en URL, procesando...');
        loginConToken(token);
        // Limpiar URL
        window.history.replaceState({}, document.title, window.location.pathname);
    }
})();

// Suscripción newsletter
function suscribirse() {
    const email = document.getElementById('newsletter-email').value;
    if (email && email.includes('@')) {
        mostrarToast('¡Gracias por suscribirte!', 'success');
        document.getElementById('newsletter-email').value = '';
    } else {
        mostrarToast('Por favor ingresa un email válido', 'error');
    }
}