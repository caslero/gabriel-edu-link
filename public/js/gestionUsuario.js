async function cargarUsuarios() {
  try {
    const response = await fetch("/api/usuarios/todos-usuarios", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const datos = await response.json();
    const tbody = document.querySelector("#tabla-usuarios tbody");
    tbody.innerHTML = "";

    datos.usuarios.forEach((usuario) => {
      const fila = document.createElement("tr");
      fila.className = "hover:bg-gray-50 transition";
      fila.innerHTML = `
        <td class="px-4 py-2 text-center border-b">${usuario.id}</td>
        <td class="px-4 py-2 text-center border-b font-medium ${usuario.borrado ?'text-[red]' : ''}">${usuario.nombre}</td>
        <td class="px-4 py-2 text-center border-b">${usuario.correo}</td>
        <td class="px-4 py-2 text-center border-b">${usuario.rol_id}</td>
        <td class="px-4 py-2 border-b">
          <div class="flex justify-center">
            <img src="${usuario.foto || "/img/usuario.png"}" class="w-10 h-10 rounded-full border shadow-sm">
          </div>
        </td>
        <td class="px-4 py-2 text-center border-b space-x-2">
          <button onclick="abrirModalEditar('${usuario.id}', '${usuario.nombre}', '${usuario.correo}', '${usuario.rol_id}')" 
                  class="bg-blue-500 text-white px-3 py-1.5 rounded-md hover:bg-blue-600 transition text-sm">
            Editar
          </button>
          
          <button onclick="confirmarEliminacion('${usuario.id}')" 
                  class="bg-red-600 text-white px-3 py-1.5 rounded-md hover:bg-red-700 transition text-sm">
            Eliminar
          </button>
        </td>
      `;
      tbody.appendChild(fila);
    });
  } catch (error) {
    console.error("Error:", error);
  }
}

// FUNCIÓN PARA MOSTRAR MODAL DE ELIMINAR
function confirmarEliminacion(id) {
  let modalContainer = document.getElementById("modal-eliminar-container");
  if (!modalContainer) {
    modalContainer = document.createElement("div");
    modalContainer.id = "modal-eliminar-container";
    document.body.appendChild(modalContainer);
  }

  modalContainer.innerHTML = `
    <div class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[60]">
      <div class="bg-white rounded-lg shadow-xl p-6 w-80 text-center">
        <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
          <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 class="text-lg font-bold text-gray-900 mb-2">¿Estás seguro?</h3>
        <p class="text-sm text-gray-500 mb-6">El usuario con ID: ${id} será marcado para eliminación.</p>
        <div class="flex justify-center space-x-3">
          <button type="button" onclick="document.getElementById('modal-eliminar-container').innerHTML=''" 
                  class="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300">
            Cancelar
          </button>
          <button id="btn-confirmar-eliminar" class="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 font-medium">
            Confirmar
          </button>
        </div>
      </div>
    </div>
  `;

  document.getElementById("btn-confirmar-eliminar").onclick = async () => {
    try {
      const response = await fetch(`/api/usuarios/eliminar-usuario`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idUsuario: id }),
      });

      const resultado = await response.json();

      mostrarNotificacion(resultado.message);
      document.getElementById("modal-eliminar-container").innerHTML = "";
      cargarUsuarios();
    } catch (error) {
      console.error("Error en eliminación:", error);
      mostrarNotificacion(error.message, error.status);
    }
  };
}

// FUNCIÓN PARA MANEJAR EL MODAL editar
function abrirModalEditar(id, nombre, correo, rolId) {
  let modal = document.getElementById("modal-editar-container");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "modal-editar-container";
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div class="bg-white rounded-lg shadow-lg p-6 w-96 text-left">
        <h3 class="text-lg font-semibold text-blue-700 mb-4">Editar Usuario</h3>
        <form id="form-editar-usuario" class="space-y-3">
          <input type="hidden" name="idUsuario" value="${id}">
          <div>
            <label class="block text-sm font-semibold">Nombre</label>
            <input type="text" name="nombre" value="${nombre}" class="w-full border p-2 rounded" required>
          </div>
          <div>
            <label class="block text-sm font-semibold">Correo</label>
            <input type="email" name="correo" value="${correo}" class="w-full border p-2 rounded" required>
          </div>
          <div>
            <label class="block text-sm font-semibold">ID Rol</label>
            <input type="number" name="rol_id" value="${rolId}" class="w-full border p-2 rounded" required>
          </div>
          <div class="flex justify-end mt-4 space-x-2">
            <button type="button" onclick="document.getElementById('modal-editar-container').innerHTML=''" 
                    class="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500">
              Cancelar
            </button>
            <button type="submit" class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  `;

  document
    .getElementById("form-editar-usuario")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const info = Object.fromEntries(formData.entries());

      try {
        const response = await fetch("/api/usuarios/actualizar-usuario", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: info.idUsuario,
            nombre: info.nombre,
            correo: info.correo,
            rol_id: info.rol_id,
          }),
        });

        const resultado = await response.json();
        console.log(resultado);

        if (resultado.status === "ok") {
          mostrarNotificacion("Usuario actualizado con éxito");
          document.getElementById("modal-editar-container").innerHTML = "";
          cargarUsuarios();
        } else {
          mostrarNotificacion(
            resultado.message || "Error al actualizar",
            "error",
          );
        }
      } catch (error) {
        console.error("Error capturado:", error.message);
        mostrarNotificacion("Error en la operación", "error");
      }
    });
}

// FUNCION PARA CARGAR ROLES
async function cargarRoles() {
  try {
    const response = await fetch("/api/roles/todos-roles", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const datos = await response.json();

    if (datos.status === "error") throw new Error("Error al obtener usuarios");

    // Suponiendo que datos.roles es un array de objetos con { nombre: "Estudiante" } etc.
    const contenedor = document.getElementById("todos-roles");

    contenedor.innerHTML = `
        <label for="rol" class="block font-semibold">Rol</label>
        <select id="rol" name="rol" class="w-full border p-2 rounded" required>
          <option value="">Seleccione</option>
          ${datos.roles
            .map(
              (rol) => `
            <option value="${rol.id}">${rol.nombre}</option>
          `,
            )
            .join("")}
        </select>
      `;
  } catch (error) {
    console.log("Error al obtener los roles:", error);
  }
}

document
  .getElementById("form-crear-usuario")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    // CREAMOS EL OBJETO EXACTO QUE PIDE EL CONTROLLER
    const usuarioParaController = {
      nombre: data.nombre,
      correo: data.correo,
      cedula: data.cedula,
      clave: data.clave,
      confirmarClave: data.clave, // El controlador lo pide para validar
      rol: data.rol, // En el HTML el select debe tener name="rol"
      pais: data.pais === "1" ? "v" : "e", // El controlador espera "v" para poner 1
      texto: "", // El controlador pide 'texto' (posiblemente para la imagen)
    };

    try {
      const response = await fetch("/api/usuarios/crear-usuario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(usuarioParaController),
      });

      const resultado = await response.json();

      if (response.ok || resultado.status === "ok") {
        e.target.reset();
        cargarUsuarios(); // Recarga la tabla
      } else {
        // Si hay error de validación, aquí verás el mensaje
        console.log("Respuesta error:", resultado);
      }
    } catch (error) {
      console.error("Error en la petición:", error);
    }
  });

// FUNCIÓN PARA NOTIFICACIONES
function mostrarNotificacion(mensaje, tipo = "exito") {
  // Eliminar notificación previa si existe
  const previa = document.getElementById("toast-notificacion");
  if (previa) previa.remove();

  const colorFondo = tipo === "exito" ? "bg-green-600" : "bg-red-600";
  const icono =
    tipo === "exito"
      ? '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>'
      : '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>';

  const toast = document.createElement("div");
  toast.id = "toast-notificacion";
  toast.className = `fixed bottom-5 right-5 ${colorFondo} text-white px-6 py-3 rounded-lg shadow-2xl flex items-center space-x-3 transform transition-all duration-500 translate-y-10 opacity-0 z-[100]`;

  toast.innerHTML = `
            <span>${icono}</span>
            <span class="font-medium">${mensaje}</span>
        `;

  document.body.appendChild(toast);

  // Animación de entrada
  setTimeout(() => {
    toast.classList.remove("translate-y-10", "opacity-0");
  }, 100);

  // Desaparecer automáticamente después de 4 segundos
  setTimeout(() => {
    toast.classList.add("translate-y-10", "opacity-0");
    setTimeout(() => toast.remove(), 500);
  }, 4000);
}
// refrescar cada 10 segundos
//setInterval(cargarUsuarios, 10000);

// --- FUNCIONALIDAD PARA VER/OCULTAR CONTRASEÑA CON CAMBIO DE ICONO ---
document.addEventListener('click', function (e) {
    const btn = e.target.closest('.toggle-password');
    
    if (btn) {
        const targetId = btn.getAttribute('data-target');
        const input = document.getElementById(targetId);
        
        // Seleccionamos ambos iconos dentro del botón
        const eyeOpen = btn.querySelector('.eye-open');
        const eyeClosed = btn.querySelector('.eye-closed');

        if (input && eyeOpen && eyeClosed) {
            if (input.type === 'password') {
                input.type = 'text';
                // Cambiar iconos
                eyeOpen.classList.add('hidden');
                eyeClosed.classList.remove('hidden');
                btn.classList.add('text-blue-600');
            } else {
                input.type = 'password';
                // Cambiar iconos de vuelta
                eyeOpen.classList.remove('hidden');
                eyeClosed.classList.add('hidden');
                btn.classList.remove('text-blue-600');
            }
        }
    }
});


// cargar al inicio
cargarUsuarios();
cargarRoles();

/** 
  document.getElementById("btn-confirmar-eliminar").onclick = async () => {
    console.log("Eliminando usuario ID:", id);
    try {
      const response = await fetch(`/api/usuarios/eliminar-usuario`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idUsuario: id }),
      });

      if (response.ok) {
        mostrarNotificacion("Usuario eliminado correctamente");
        document.getElementById("modal-eliminar-container").innerHTML = "";
        cargarUsuarios();
      } else {
        mostrarNotificacion("Error al eliminar", "error");
      }
    } catch (error) {
      console.error("Error en eliminación:", error);
    }
  };
*/
