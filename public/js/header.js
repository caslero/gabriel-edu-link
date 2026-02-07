



const sincronizarHeaderYPerfil = async () => {
    try {
        const response = await fetch('/api/perfil/obtener-usuario', {
            method: "GET",
            credentials: 'include', 
            headers: { "Content-Type": "application/json" }
        });

        if (response.ok) {
            const usuario = await response.json();
            const fotoDefault = '/img/usuario.png'; 
            
            const validarFoto = (path) => {
                if (!path) return fotoDefault;
                return path.startsWith('http') || path.startsWith('/') ? path : `/${path}`;
            };

            const rutaFotoFinal = validarFoto(usuario.foto);
            const rolesMap = { 1: 'ADMINISTRADOR', 2: 'DOCENTE', 3: 'ESTUDIANTE' };

            // --- 1. ACTUALIZACIÓN DEL HEADER (Escritorio y Menú Desplegable) ---
            
            // Nombre en el botón del perfil y dentro del menú
            const nombreHeader = document.querySelector('#profileToggle span');
            const nombreMenuInterno = document.querySelector('#profileMenu .p-4 p');
            if (nombreHeader) nombreHeader.textContent = usuario.nombre;
            if (nombreMenuInterno) nombreMenuInterno.textContent = usuario.nombre;

            // Foto en el botón del perfil
            const fotoHeader = document.querySelector('#profileToggle img');
            if (fotoHeader) {
                fotoHeader.src = rutaFotoFinal;
                fotoHeader.onerror = () => { fotoHeader.src = fotoDefault; };
            }

            // Badge del Rol en el menú desplegable
            const badgeRol = document.querySelector('#profileMenu .p-4 span');
            if (badgeRol) {
                badgeRol.textContent = rolesMap[usuario.rol_id] || usuario.rol || 'USUARIO';
            }

            // --- 2. ACTUALIZACIÓN DEL MENÚ MÓVIL ---
            const mobileContainer = document.querySelector('#mobileMenu .flex.items-center');
            if (mobileContainer) {
                const fotoMobile = mobileContainer.querySelector('img');
                const nombreMobile = mobileContainer.querySelector('p');
                if (fotoMobile) fotoMobile.src = rutaFotoFinal;
                if (nombreMobile) nombreMobile.textContent = usuario.nombre;
            }

            // --- 3. ACTUALIZACIÓN VISTA PERFIL (Si existe en la página) ---
            const fotoPrincipal = document.querySelector('#formFotoUsuario img');
            if (fotoPrincipal) {
                fotoPrincipal.src = rutaFotoFinal;
            }

            const nombreTitulo = document.querySelector('h2.text-2xl.font-bold');
            if (nombreTitulo) nombreTitulo.textContent = usuario.nombre;

            const roleBadgePerfil = document.querySelector('.rounded-full.bg-blue-100');
            if (roleBadgePerfil) {
                roleBadgePerfil.textContent = rolesMap[usuario.rol_id] || 'Usuario';
            }

            // --- 4. CAMPOS OCULTOS Y LISTAS ---
            const inputUserId = document.querySelector('input[name="userId"]');
            if (inputUserId) inputUserId.value = usuario.id;

            console.log("Header y Perfil sincronizados.");

        } else if (response.status === 401) {
            window.location.href = '/login';
        }
    } catch (error) {
        console.error('Error al sincronizar datos:', error);
    }
};

// Ejecutar al cargar la página
document.addEventListener('DOMContentLoaded', sincronizarHeaderYPerfil); 
 
 const menuToggle = document.getElementById("menuToggle");
  const mobileMenu = document.getElementById("mobileMenu");
  const profileToggle = document.getElementById("profileToggle");
  const profileMenu = document.getElementById("profileMenu");
  const cerrarSesionBtn = document.getElementById("cerrarSesion");

  if (cerrarSesionBtn) {
    cerrarSesionBtn.addEventListener("click", logOut);
  }

  async function logOut() {
    // 1. Referencias de los elementos del Overlay (asegúrate de haber pegado el HTML)
    const overlay = document.getElementById('logoutOverlay');
    const content = document.getElementById('logoutContent');
    const progressBar = document.getElementById('logoutProgress');

    try {
      // 2. Iniciar Animación Visual inmediatamente
      if (overlay) {
        overlay.classList.remove('hidden');
        overlay.classList.add('flex');
        
        // Pequeño delay para que Tailwind detecte la transición
        setTimeout(() => {
          content.classList.remove('scale-95', 'opacity-0');
          content.classList.add('scale-100', 'opacity-100');
          progressBar.style.width = '100%'; 
        }, 50);
      }

      // 3. Petición al servidor (sucede en segundo plano mientras el usuario ve la animación)
      const response = await fetch('/api/login/cerrar-sesion', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      // 4. El setTimeout que ya tenías (coincide con la duración de la barra de carga)
      setTimeout(() => {
        // Efecto de desvanecimiento final
        if (overlay) overlay.classList.add('opacity-0');
        
        setTimeout(() => {
          window.location.href = '/';
        }, 400);
      }, 3000);

    } catch (error) {
      console.log('Error al cerrar sesión:', error);
      // Si hay error, ocultamos el overlay para no dejar al usuario atrapado
      if (overlay) overlay.classList.add('hidden');
    }
  }

  // --- Lógica de Menús ---
  if (menuToggle) {
    menuToggle.addEventListener("click", () => {
      mobileMenu.classList.toggle("hidden");
    });
  }

  if (profileToggle) {
    profileToggle.addEventListener("click", () => {
      profileMenu.classList.toggle("hidden");
    });
  }
  document.addEventListener("DOMContentLoaded", () => {
    const authButtons = document.getElementById("authButtons");
    const userLoggedIn = document.getElementById("profileToggle"); // Existe solo si hay JWT válido

    if (authButtons) {
        if (userLoggedIn) {
            authButtons.classList.add("hidden");
        } else {
            authButtons.classList.remove("hidden");
        }
    }
});