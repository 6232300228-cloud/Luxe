// ============================================
// VARIABLES GLOBALES
// ============================================
let user = JSON.parse(localStorage.getItem("user"));

if (!user) {
    Swal.fire({
        icon: 'warning',
        title: 'Sesión no iniciada',
        text: 'Por favor, inicia sesión para ver tu perfil',
        timer: 2000,
        showConfirmButton: false,
        position: 'top-end',
        toast: true,
        didClose: () => {
            window.location.href = "login.html";
        }
    });
} else {
    // Referencias a los elementos
    const nombreInput = document.getElementById("perfilNombreInput");
    const correoInput = document.getElementById("perfilCorreoInput");
    const telefonoInput = document.getElementById("perfilTelefonoInput");
    const calleInput = document.getElementById("perfilCalleInput");
    const numeroInput = document.getElementById("perfilNumeroInput");
    const coloniaInput = document.getElementById("perfilColoniaInput");
    const estadoInput = document.getElementById("perfilEstadoInput");
    const cpInput = document.getElementById("perfilCpInput");
    const referenciaInput = document.getElementById("perfilReferenciaInput");
    const tarjetaInput = document.getElementById("perfilTarjetaInput");
    const btnGuardar = document.getElementById("btnGuardar");
    const avatarInicial = document.getElementById("avatarInicial");
    const btnCambiarFoto = document.getElementById("btnCambiarFoto");
    const inputFotoPerfil = document.getElementById("inputFotoPerfil");

// ============================================
// FUNCIONES PARA FOTO DE PERFIL
// ============================================
function cargarFotoPerfil() {
    const fotoGuardada = localStorage.getItem(`foto_perfil_${user.correo}`);
    if (fotoGuardada) {
        avatarInicial.style.backgroundImage = `url(${fotoGuardada})`;
        avatarInicial.style.backgroundSize = "cover";
        avatarInicial.style.backgroundPosition = "center";
        avatarInicial.textContent = "";
    } else if (user.nombre) {
        avatarInicial.textContent = user.nombre.charAt(0).toUpperCase();
        avatarInicial.style.backgroundImage = "none";
    }
}

function guardarFotoPerfil(base64Image) {
    localStorage.setItem(`foto_perfil_${user.correo}`, base64Image);
    avatarInicial.style.backgroundImage = `url(${base64Image})`;
    avatarInicial.style.backgroundSize = "cover";
    avatarInicial.style.backgroundPosition = "center";
    avatarInicial.textContent = "";
    
    const toast = document.getElementById("toast");
    if (toast) {
        toast.textContent = "Foto de perfil actualizada";
        toast.classList.add("show");
        setTimeout(() => toast.classList.remove("show"), 2000);
    }
}

if (btnCambiarFoto && inputFotoPerfil) {
    btnCambiarFoto.addEventListener("click", (e) => {
        e.preventDefault();
        inputFotoPerfil.click();
    });
    
    inputFotoPerfil.addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                Swal.fire({
                    icon: 'error',
                    title: 'Imagen muy grande',
                    text: 'La imagen debe ser menor a 2MB',
                    timer: 2000,
                    showConfirmButton: false,
                    position: 'top-end',
                    toast: true
                });
                return;
            }
            
            const reader = new FileReader();
            reader.onload = function(e) {
                guardarFotoPerfil(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    });
}

// ============================================
// PARSEAR DIRECCIÓN ANTIGUA
// ============================================
function parsearDireccionAntigua(direccionCompleta) {
    if (!direccionCompleta) {
        return {
            calle: "",
            numero: "",
            colonia: "",
            estado: "",
            cp: "",
            referencia: ""
        };
    }
    
    const partes = direccionCompleta.split(',');
    
    let calle = "";
    let numero = "";
    let colonia = "";
    let estado = "";
    let cp = "";
    
    if (partes[0]) {
        const calleYNumero = partes[0].trim();
        const matchNumero = calleYNumero.match(/#(\d+)/);
        if (matchNumero) {
            calle = calleYNumero.replace(/#\d+/, '').trim();
            numero = matchNumero[1];
        } else {
            calle = calleYNumero;
            numero = "";
        }
    }
    
    if (partes[1]) colonia = partes[1].trim();
    if (partes[2]) estado = partes[2].trim();
    if (partes[3]) {
        const cpMatch = partes[3].match(/C\.P\.\s*(\d+)/);
        if (cpMatch) cp = cpMatch[1];
    }
    
    return {
        calle: calle,
        numero: numero,
        colonia: colonia,
        estado: estado,
        cp: cp,
        referencia: ""
    };
}

// ============================================
// OBTENER DIRECCIÓN
// ============================================
let direccionDetalles = null;

if (user.direccion_detallada && typeof user.direccion_detallada === 'object') {
    direccionDetalles = user.direccion_detallada;
} else if (user.direccion && typeof user.direccion === 'string') {
    direccionDetalles = parsearDireccionAntigua(user.direccion);
    user.direccion_detallada = direccionDetalles;
    localStorage.setItem("user", JSON.stringify(user));
} else {
    direccionDetalles = {
        calle: "",
        numero: "",
        colonia: "",
        estado: "",
        cp: "",
        referencia: ""
    };
}

// ============================================
// MOSTRAR DATOS AL CARGAR
// ============================================
nombreInput.value = user.nombre || "";
correoInput.value = user.correo || "";

let telefonoLimpio = user.telefono || "";
telefonoLimpio = telefonoLimpio.replace('+52', '');
telefonoInput.value = telefonoLimpio;

calleInput.value = direccionDetalles.calle || "";
numeroInput.value = direccionDetalles.numero || "";
coloniaInput.value = direccionDetalles.colonia || "";
estadoInput.value = direccionDetalles.estado || "";
cpInput.value = direccionDetalles.cp || "";
referenciaInput.value = direccionDetalles.referencia || "";

tarjetaInput.value = user.tarjeta || "";

cargarFotoPerfil();

// Formatear número de tarjeta mientras se escribe
tarjetaInput.addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 16) value = value.slice(0, 16);
    value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    e.target.value = value;
});

// ============================================
// GUARDAR CAMBIOS
// ============================================
btnGuardar.onclick = () => {
    if (nombreInput.value.trim() === "") {
        Swal.fire({
            icon: 'error',
            title: 'Campo obligatorio',
            text: 'El nombre es obligatorio',
            timer: 2000,
            showConfirmButton: false,
            position: 'top-end',
            toast: true
        });
        return;
    }
    
    if (correoInput.value.trim() === "") {
        Swal.fire({
            icon: 'error',
            title: 'Campo obligatorio',
            text: 'El correo es obligatorio',
            timer: 2000,
            showConfirmButton: false,
            position: 'top-end',
            toast: true
        });
        return;
    }
    
    if (!correoInput.value.includes('@')) {
        Swal.fire({
            icon: 'error',
            title: 'Correo inválido',
            text: 'Ingresa un correo electrónico válido',
            timer: 2000,
            showConfirmButton: false,
            position: 'top-end',
            toast: true
        });
        return;
    }

    const telefonoValor = telefonoInput.value.replace(/\D/g, '');
    if (telefonoValor && telefonoValor.length !== 10) {
        Swal.fire({
            icon: 'error',
            title: 'Teléfono inválido',
            text: 'El teléfono debe tener 10 dígitos',
            timer: 2000,
            showConfirmButton: false,
            position: 'top-end',
            toast: true
        });
        return;
    }

    const nuevaDireccionDetallada = {
        calle: calleInput.value.trim(),
        numero: numeroInput.value.trim(),
        colonia: coloniaInput.value.trim(),
        estado: estadoInput.value.trim(),
        cp: cpInput.value.trim(),
        referencia: referenciaInput.value.trim()
    };

    let direccionCompleta = "";
    if (nuevaDireccionDetallada.calle) {
        direccionCompleta = `${nuevaDireccionDetallada.calle}`;
        if (nuevaDireccionDetallada.numero) direccionCompleta += ` #${nuevaDireccionDetallada.numero}`;
        if (nuevaDireccionDetallada.colonia) direccionCompleta += `, ${nuevaDireccionDetallada.colonia}`;
        if (nuevaDireccionDetallada.estado) direccionCompleta += `, ${nuevaDireccionDetallada.estado}`;
        if (nuevaDireccionDetallada.cp) direccionCompleta += `, C.P. ${nuevaDireccionDetallada.cp}`;
        if (nuevaDireccionDetallada.referencia) direccionCompleta += ` (Ref: ${nuevaDireccionDetallada.referencia})`;
    }

    user.nombre = nombreInput.value.trim();
    user.correo = correoInput.value.trim();
    user.telefono = telefonoValor ? `+52${telefonoValor}` : "";
    user.direccion = direccionCompleta;
    user.direccion_detallada = nuevaDireccionDetallada;
    user.tarjeta = tarjetaInput.value.trim();

    localStorage.setItem("user", JSON.stringify(user));

    Swal.fire({
        icon: 'success',
        title: '¡Datos actualizados!',
        text: 'Tu perfil se ha actualizado correctamente',
        timer: 1500,
        showConfirmButton: false,
        position: 'top-end',
        toast: true,
        didClose: () => {
            window.location.reload();
        }
    });
};
}