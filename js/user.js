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
      const primerNombre = user.nombre.split(' ')[0];
      userName.textContent = primerNombre ;  // ✅ BIEN: solo nombre
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

// Agregar funcionalidad de clic para móvil
document.addEventListener('DOMContentLoaded', function() {
  const dropbtn = document.querySelector('.dropbtn');
  const dropdown = document.getElementById('user-menu');
  
  if (dropbtn && dropdown) {
    dropbtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      dropdown.classList.toggle('active');
    });
    
    document.addEventListener('click', function(e) {
      if (!dropdown.contains(e.target)) {
        dropdown.classList.remove('active');
      }
    });
  }
});