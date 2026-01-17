00document.addEventListener("DOMContentLoaded", () => {
  const formLogin = document.getElementById("formLogin");
  const alertContainer = document.getElementById("alertContainer");
  const btnAcceder = document.getElementById("btnAcceder");
  
  const togglePassword = document.getElementById("togglePassword");
  const passwordInput = document.getElementById("clave");

  if (!formLogin) return;

  // --- Lógica del Botón Ver Contraseña con Cambio de Icono ---
  if (togglePassword && passwordInput) {
    togglePassword.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      const isPassword = passwordInput.type === "password";
      passwordInput.type = isPassword ? "text" : "password";
      
      const svgIcon = togglePassword.querySelector('svg');

      if (isPassword) {
        // MOSTRAR CLAVE: Poner Ojo Tachado y color azul
        svgIcon.classList.remove("text-gray-500");
        svgIcon.classList.add("text-blue-600");
        
        // Path del ojo tachado (HeroIcons)
        svgIcon.innerHTML = `
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
        `;
      } else {
        // OCULTAR CLAVE: Poner Ojo normal y color gris
        svgIcon.classList.remove("text-blue-600");
        svgIcon.classList.add("text-gray-500");
        
        // Path del ojo normal original
        svgIcon.innerHTML = `
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        `;
      }
    });
  }

  // --- Manejo del Envío con Fetch (Se mantiene igual) ---
  formLogin.addEventListener("submit", async (e) => {
    e.preventDefault();
    const correo = document.getElementById("correo").value;
    const clave = passwordInput.value;

    btnAcceder.disabled = true;
    btnAcceder.innerHTML = `
      <span class="flex items-center justify-center">
        <svg class="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24" fill="none">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Verificando...
      </span>`;
    
    alertContainer.innerHTML = ""; 

    try {
      const response = await fetch("/api/login/iniciar-sesion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, clave }),
      });

      const resultado = await response.json();

      if (response.ok && resultado.status === "ok") {
        mostrarAlerta(resultado.message, "success");
        setTimeout(() => {
          window.location.href = resultado.data.redirect || "/";
        }, 1200);
      } else {
        mostrarAlerta(resultado.message || "Credenciales incorrectas", "error");
        resetBtn();
      }
    } catch (error) {
      console.error("Error en login:", error);
      mostrarAlerta("Error de conexión con el servidor", "error");
      resetBtn();
    }
  });

  function resetBtn() {
    btnAcceder.disabled = false;
    btnAcceder.innerText = "Acceder";
  }

  function mostrarAlerta(mensaje, tipo) {
    const bgColor = tipo === "success" 
      ? "bg-green-100 text-green-800 border-green-300" 
      : "bg-red-100 text-red-800 border-red-300";
    
    alertContainer.innerHTML = `
      <div class="${bgColor} border px-4 py-3 rounded text-center shadow-sm mb-4" role="alert">
        <span class="font-medium">${mensaje}</span>
      </div>`;
  }
});