function checkUser() {
  const user = JSON.parse(localStorage.getItem("user"));
  
  const loginBtn = document.getElementById("login-btn");
  const userMenu = document.getElementById("user-menu");
  const userName = document.getElementById("user-name");
  const logoutBtn = document.getElementById("logout-btn");

  if (user) {
    if (loginBtn) loginBtn.style.display = "none";
    if (userMenu) userMenu.style.display = "inline-block";
    
    if (userName) {
      // ✅ SOLO PRIMER NOMBRE
      const primerNombre = user.nombre.split(' ')[0];
      userName.textContent = "> " + primerNombre;
    }

    if (logoutBtn) {
      logoutBtn.onclick = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        alert("Sesión cerrada");
        window.location.href = "index.html";
      };
    }
  } else {
    if (loginBtn) loginBtn.style.display = "inline";
    if (userMenu) userMenu.style.display = "none";
  }
}

document.addEventListener("DOMContentLoaded", checkUser);