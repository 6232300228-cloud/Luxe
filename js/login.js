// LOGIN
btnLogin.addEventListener("click", async () => {
    let correo = document.getElementById("login-correo").value;
    let contraseña = document.getElementById("login-pass").value;

    if (correo === "" || !correo.includes("@") || contraseña === "") {
        alert("⚠️ Por favor, ingresa tu correo y contraseña correctamente");
        return;
    }

    try {
        console.log('📤 Intentando conectar a:', 'http://localhost:3000/api/auth/login');
        
        const response = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ correo, contraseña })
        });

        const data = await response.json();
        console.log('📥 Respuesta:', data);

        if (response.ok) {
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));
            alert(`✅ Bienvenido ${data.user.nombre}`);

            if (data.user.role === "admin" || data.user.role === "empleado") {
                window.location.href = "dashboard.html";
            } else {
                window.location.href = "index.html";
            }
        } else {
            alert(data.error || "Error al iniciar sesión");
        }
    } catch (error) {
        console.error('❌ Error completo:', error);
        alert("❌ Error de conexión con el servidor. Asegúrate de que el backend esté corriendo en http://localhost:3000");
    }
});