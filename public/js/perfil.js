
document.addEventListener('DOMContentLoaded', () => {
    
    // 1. FUNCIÓN PARA OBTENER Y MOSTRAR DATOS 
const cargarDatosUsuario = async () => {
    try {
        // IMPORTANTE: Agregamos credentials: 'include' para que el navegador envíe la cookie JWT
        const response = await fetch('/api/perfil/obtener-usuario', {
            method: "GET",
            credentials: 'include', 
            headers: { "Content-Type": "application/json" }
        });

        if (response.ok) {
            const usuario = await response.json();

            // --- LÓGICA PARA LA FOTO ---
            // Definimos una foto por defecto si el usuario no tiene o si falla la carga
            const fotoDefault = '/img/default.png'; // Asegúrate que esta ruta exista en tu carpeta public
            
            const validarFoto = (path) => {
                if (!path) return fotoDefault;
                // Si la ruta no empieza con '/', se la agregamos para que sea relativa a la raíz
                return path.startsWith('http') || path.startsWith('/') ? path : `/${path}`;
            };

            const rutaFotoFinal = validarFoto(usuario.foto);

            // --- USO DEL ID PARA FORMULARIOS ---
            const formPassword = document.querySelector('form[action="/users/update-password"]');
            if (formPassword && usuario.id) {
                let inputId = formPassword.querySelector('input[name="userId"]');
                if (!inputId) {
                    inputId = document.createElement('input');
                    inputId.type = 'hidden';
                    inputId.name = 'userId';
                    formPassword.appendChild(inputId);
                }
                inputId.value = usuario.id;
            }

            // --- ACTUALIZACIÓN DE HEADER (Nombres y Fotos) ---
            ['userNameNav', 'userNameMenu', 'userNameMobile'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.textContent = usuario.nombre;
            });

            ['userAvatarNav', 'userAvatarMobile'].forEach(id => {
                const el = document.getElementById(id);
                if (el) {
                    el.src = rutaFotoFinal;
                    // Si la foto guardada da error 404, ponemos la default
                    el.onerror = () => { el.src = fotoDefault; };
                }
            });

            // --- ACTUALIZACIÓN VISTA PERFIL ---
            const fotoPrincipal = document.querySelector('#formFotoUsuario img');
            if (fotoPrincipal) {
                fotoPrincipal.src = rutaFotoFinal;
                fotoPrincipal.onerror = () => { fotoPrincipal.src = fotoDefault; };
            }

            const nombreTitulo = document.querySelector('h2.text-2xl.font-bold');
            const correoSubtitulo = document.querySelector('p.text-gray-600');
            if (nombreTitulo) nombreTitulo.textContent = usuario.nombre;
            if (correoSubtitulo) correoSubtitulo.textContent = usuario.correo;

            // Rol Badge
            const roleBadge = document.querySelector('.rounded-full.bg-blue-100');
            if (roleBadge) {
                const roles = { 1: 'Administrador', 2: 'Docente', 3: 'Estudiante' };
                roleBadge.textContent = roles[usuario.rol_id] || `ID Rol: ${usuario.rol_id}`;
            }

            // Lista de Identidad
            const listaDatos = document.querySelectorAll('.bg-gray-50 ul li');
            if (listaDatos && listaDatos.length >= 3) {
                listaDatos[0].innerHTML = `<strong>Cédula:</strong> ${usuario.cedula || 'N/A'}`;
                listaDatos[1].innerHTML = `<strong>Correo:</strong> ${usuario.correo || 'N/A'}`;
                
                const nacionalidad = (usuario.pais == 1 || usuario.pais === true) ? 'Venezolano' : 'Extranjero';
                listaDatos[2].innerHTML = `<strong>Nacionalidad:</strong> ${nacionalidad}`;
                
                if (listaDatos.length >= 4) {
                    listaDatos[3].innerHTML = `<strong>ID de Usuario:</strong> ${usuario.id}`;
                }
            }
            console.log("Perfil sincronizado correctamente.");

        } else if (response.status === 401) {
            console.warn("Sesión no válida, redirigiendo...");
            window.location.href = '/login';
        }
    } catch (error) {
        console.error('Error al sincronizar datos:', error);
    }
};

// Ejecutar al cargar la página
document.addEventListener('DOMContentLoaded', cargarDatosUsuario);


    // 2. LÓGICA PARA MOSTRAR/OCULTAR CONTRASEÑA
    const togglePasswordButtons = document.querySelectorAll('.toggle-password');
    togglePasswordButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const input = document.getElementById(targetId);
            const eyeOpen = this.querySelector('.eye-open');
            const eyeClosed = this.querySelector('.eye-closed');

            if (input.type === "password") {
                input.type = "text";
                eyeOpen.classList.add('hidden');
                eyeClosed.classList.remove('hidden');
            } else {
                input.type = "password";
                eyeOpen.classList.remove('hidden');
                eyeClosed.classList.add('hidden');
            }
        });
    });

    // 3. ENVÍO AUTOMÁTICO DE FOTO AL SELECCIONARLA
    const fotoInput = document.getElementById('fotoInputUsuario');
    if (fotoInput) {
        fotoInput.addEventListener('change', () => {
            document.getElementById('formFotoUsuario').submit();
        });
    }

    //4. Cambiar Clave
    const manejarActualizacionClave = () => {
    const formPassword = document.querySelector('form[action="/users/update-password"]');
    
    if (formPassword) {
        formPassword.addEventListener('submit', async (e) => {
            e.preventDefault(); // Evitamos que la página se recargue

            const claveActual = document.getElementById('claveActual').value;
            const nuevaClave = document.getElementById('nuevaClave').value;
            const confirmarClave = document.getElementById('confirmarClave').value;

            // Validación básica en el cliente
            if (nuevaClave !== confirmarClave) {
                alert("La nueva contraseña y la confirmación no coinciden.");
                return;
            }

            try {
                const response = await fetch('/api/perfil/actualizar-clave', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        claveActual,
                        nuevaClave
                    })
                });

                const resultado = await response.json();

                if (response.ok) {
                    alert("Contraseña actualizada con éxito.");
                    formPassword.reset(); // Limpiamos los campos
                } else {
                    alert("Error: " + (resultado.error || "No se pudo actualizar la clave"));
                }
            } catch (error) {
                console.error("Error al enviar la petición:", error);
                alert("Error de conexión con el servidor.");
            }
        });
    }
};

    cargarDatosUsuario();
    manejarActualizacionClave();
});