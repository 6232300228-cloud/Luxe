// perfil.js - Versión mejorada con dirección detallada
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
    
    // Nuevos campos de dirección
    const calleInput = document.getElementById("perfilCalleInput");
    const numeroInput = document.getElementById("perfilNumeroInput");
    const coloniaInput = document.getElementById("perfilColoniaInput");
    const estadoInput = document.getElementById("perfilEstadoInput");
    const cpInput = document.getElementById("perfilCpInput");
    const referenciaInput = document.getElementById("perfilReferenciaInput");
    
    const tarjetaInput = document.getElementById("perfilTarjetaInput");
    const btnGuardar = document.getElementById("btnGuardar");

    // ============================================
    // FUNCIÓN PARA PARSEAR DIRECCIÓN ANTIGUA (formato texto plano)
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
        
        // Intentar extraer partes de la dirección
        // Formato esperado: "Calle #Numero, Colonia, Estado, C.P. 12345"
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
    // OBTENER DIRECCIÓN (nueva o antigua)
    // ============================================
    let direccionDetalles = null;
    
    // Si existe dirección detallada, usarla
    if (user.direccion_detallada && typeof user.direccion_detallada === 'object') {
        direccionDetalles = user.direccion_detallada;
    } 
    // Si existe dirección en formato antiguo, parsearla
    else if (user.direccion && typeof user.direccion === 'string') {
        direccionDetalles = parsearDireccionAntigua(user.direccion);
        // Guardar la versión parseada para futuras actualizaciones
        user.direccion_detallada = direccionDetalles;
        localStorage.setItem("user", JSON.stringify(user));
    } 
    // Si no hay dirección, crear vacía
    else {
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
    
    // Limpiar +52 del teléfono para mostrarlo
    let telefonoLimpio = user.telefono || "";
    telefonoLimpio = telefonoLimpio.replace('+52', '');
    telefonoInput.value = telefonoLimpio;
    
    // Dirección detallada
    calleInput.value = direccionDetalles.calle || "";
    numeroInput.value = direccionDetalles.numero || "";
    coloniaInput.value = direccionDetalles.colonia || "";
    estadoInput.value = direccionDetalles.estado || "";
    cpInput.value = direccionDetalles.cp || "";
    referenciaInput.value = direccionDetalles.referencia || "";
    
    tarjetaInput.value = user.tarjeta || "";

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
        // Validaciones
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

        // Validar teléfono (10 dígitos)
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

        // Actualizar dirección detallada
        const nuevaDireccionDetallada = {
            calle: calleInput.value.trim(),
            numero: numeroInput.value.trim(),
            colonia: coloniaInput.value.trim(),
            estado: estadoInput.value.trim(),
            cp: cpInput.value.trim(),
            referencia: referenciaInput.value.trim()
        };

        // Crear dirección completa para compatibilidad con versiones anteriores
        let direccionCompleta = "";
        if (nuevaDireccionDetallada.calle) {
            direccionCompleta = `${nuevaDireccionDetallada.calle}`;
            if (nuevaDireccionDetallada.numero) direccionCompleta += ` #${nuevaDireccionDetallada.numero}`;
            if (nuevaDireccionDetallada.colonia) direccionCompleta += `, ${nuevaDireccionDetallada.colonia}`;
            if (nuevaDireccionDetallada.estado) direccionCompleta += `, ${nuevaDireccionDetallada.estado}`;
            if (nuevaDireccionDetallada.cp) direccionCompleta += `, C.P. ${nuevaDireccionDetallada.cp}`;
            if (nuevaDireccionDetallada.referencia) direccionCompleta += ` (Ref: ${nuevaDireccionDetallada.referencia})`;
        }

        // Actualizar usuario
        user.nombre = nombreInput.value.trim();
        user.correo = correoInput.value.trim();
        user.telefono = telefonoValor ? `+52${telefonoValor}` : "";
        user.direccion = direccionCompleta;
        user.direccion_detallada = nuevaDireccionDetallada;
        user.tarjeta = tarjetaInput.value.trim();

        // Guardar en localStorage
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