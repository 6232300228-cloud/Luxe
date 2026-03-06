function checkUser() {
  const user = JSON.parse(localStorage.getItem("user"));
  
  const loginBtn = document.getElementById("login-btn");
  const userMenu = document.getElementById("user-menu");
  const userName = document.getElementById("user-name");
  const logoutBtn = document.getElementById("logout-btn");

  if (user) {
    // Si hay usuario: sale el menú y ocultamos "Iniciar sesión"
    if (loginBtn) loginBtn.style.display = "none";
    if (userMenu) userMenu.style.display = "inline-block";
    
    if (userName) {
      userName.textContent = "Hola, " + user.nombre;
    }

    if (logoutBtn) {
      logoutBtn.onclick = () => {
        localStorage.removeItem("user");
        alert("Sesión cerrada ");
        window.location.href = "index.html";
      };
    }
  } else {
    // Si no hay usuario: sale "Iniciar sesión" y ocultamos el menú
    if (loginBtn) loginBtn.style.display = "inline";
    if (userMenu) userMenu.style.display = "none";
  }
}

// Ejecutar al cargar la página
document.addEventListener("DOMContentLoaded", checkUser);