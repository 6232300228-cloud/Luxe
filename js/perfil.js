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

    // Función para extraer dirección detallada
    function parsearDireccion(direccionCompleta, direccionDetallada) {
        if (direccionDetallada) {
            return direccionDetallada;
        }
        
        // Fallback: intentar parsear la dirección completa
        return {
            calle: "",
            numero: "",
            colonia: "",
            estado: "",
            cp: "",
            referencia: ""
        };
    }

    // Obtener dirección detallada
    const direccionDetalles = user.direccion_detallada || parsearDireccion(user.direccion);

    // Mostrar datos al cargar
    nombreInput.value = user.nombre || "";
    correoInput.value = user.correo || "";
    
    // Limpiar +52 del teléfono para mostrarlo
    telefonoInput.value = user.telefono ? user.telefono.replace('+52', '') : "";
    
    // Dirección detallada
    calleInput.value = direccionDetalles.calle || "";
    numeroInput.value = direccionDetalles.numero || "";
    coloniaInput.value = direccionDetalles.colonia || "";
    estadoInput.value = direccionDetalles.estado || "";
    cpInput.value = direccionDetalles.cp || "";
    referenciaInput.value = direccionDetalles.referencia || "";
    
    tarjetaInput.value = user.tarjeta || "";

    // Guardar cambios
    btnGuardar.onclick = () => {
        // Validaciones
        if (nombreInput.value.trim() === "" || correoInput.value.trim() === "") {
            Swal.fire({
                icon: 'error',
                title: 'Campos obligatorios',
                text: 'El nombre y correo son obligatorios',
                timer: 2000,
                showConfirmButton: false,
                position: 'top-end',
                toast: true
            });
            return;
        }

        // Actualizar dirección detallada
        const nuevaDireccionDetallada = {
            calle: calleInput.value,
            numero: numeroInput.value,
            colonia: coloniaInput.value,
            estado: estadoInput.value,
            cp: cpInput.value,
            referencia: referenciaInput.value
        };

        // Crear dirección completa para compatibilidad
        const direccionCompleta = `${calleInput.value} #${numeroInput.value}, ${coloniaInput.value}, ${estadoInput.value}, C.P. ${cpInput.value}`;

        // Actualizar usuario
        user.nombre = nombreInput.value;
        user.correo = correoInput.value;
        user.telefono = telefonoInput.value ? `+52${telefonoInput.value}` : "";
        user.direccion = direccionCompleta;
        user.direccion_detallada = nuevaDireccionDetallada;
        user.tarjeta = tarjetaInput.value;

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