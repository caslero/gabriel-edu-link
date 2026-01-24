document.addEventListener("DOMContentLoaded", () => {
  const semestreSelect = document.getElementById("semestre");
  const materiaSelect = document.getElementById("materia_id");
  const seccionInput = document.getElementById("seccion_nombre");
  const formRegistro = document.getElementById("formRegistroSeccion");

  // 1. Lógica de filtros en cascada (Local)
  semestreSelect?.addEventListener("change", () => {
    const semestre = semestreSelect.value;
    materiaSelect.value = "";
    if (seccionInput) {
      seccionInput.value = "";
      seccionInput.disabled = true;
    }

    if (semestre) {
      Array.from(materiaSelect.options).forEach((opt) => {
        if (!opt.value) return;
        const coincide = opt.getAttribute("data-semestre") === semestre;
        opt.hidden = !coincide;
        opt.disabled = !coincide;
      });
      materiaSelect.disabled = false;
    } else {
      materiaSelect.disabled = true;
    }
  });

  materiaSelect?.addEventListener("change", () => {
    if (seccionInput) seccionInput.disabled = !materiaSelect.value;
  });

  // 2. Registrar Sección
  formRegistro?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(formRegistro);
    const payload = Object.fromEntries(formData.entries());

    /* NOTA: El usuario_id se recomienda obtenerlo en el Backend 
           vía req.session para mayor seguridad.
        */
    console.log("Enviando datos de sección:", payload);

    try {
      const res = await fetch("/api/materias/crear-seccion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok || data.status === "ok") {
        mostrarNotificacion(data.message || "Sección registrada correctamente");
        formRegistro.reset();

        // Recarga para ver al nuevo usuario creador en la tabla
        setTimeout(() => window.location.reload(), 1000);
      } else {
        mostrarNotificacion(data.message || "Error al crear", "error");
      }
    } catch (error) {
      console.error("Error:", error);
      mostrarNotificacion("Error de conexión con el servidor", "error");
    }
  });
});

// --- MODAL DINÁMICO PARA EDITAR SECCIÓN ---

function abrirModalEditarSeccion(id, nombre, materiaId) {
  let modal = document.getElementById("modal-editar-seccion-container");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "modal-editar-seccion-container";
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
        <div class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div class="bg-white rounded-lg shadow-lg p-6 w-96 text-left">
                <h3 class="text-lg font-semibold text-blue-700 mb-4">Actualizar Información</h3>
                <form id="form-editar-seccion" class="space-y-3">
                    <input type="hidden" name="idSeccion" value="${id}">
                    <div>
                        <label class="block text-sm font-semibold text-gray-600">Nombre de la Sección</label>
                        <input type="text" name="nombre" value="${nombre}" class="w-full border p-2 rounded focus:ring-2 focus:ring-blue-400 outline-none" required>
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-gray-400">ID Materia Relacionada</label>
                        <input type="number" name="materia_id" value="${materiaId}" class="w-full border p-2 rounded bg-gray-100 cursor-not-allowed" readonly>
                    </div>
                    <p class="text-xs text-gray-500 italic">* La edición quedará registrada a nombre de tu usuario.</p>
                    <div class="flex justify-end mt-4 space-x-2">
                        <button type="button" onclick="document.getElementById('modal-editar-seccion-container').innerHTML=''" 
                                class="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition-colors">
                            Cancelar
                        </button>
                        <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 shadow-md transition-colors">
                            Guardar Cambios
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;

  document
    .getElementById("form-editar-seccion")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const info = Object.fromEntries(formData.entries());

      try {
        const response = await fetch(`/api/materias/actualizar-seccion`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: info.idSeccion,
            nombre: info.nombre,
            // El backend se encarga de actualizar el updated_at y verificar el usuario
          }),
        });

        const resultado = await response.json();

        if (response.ok || resultado.status === "ok") {
          mostrarNotificacion("Sección actualizada con éxito");
          modal.innerHTML = "";
          window.location.reload();
        } else {
          mostrarNotificacion(
            resultado.message || "Error al actualizar",
            "error",
          );
        }
      } catch (error) {
        console.error("Error:", error);
        mostrarNotificacion("Error de servidor", "error");
      }
    });
}

// --- MODAL DINÁMICO PARA ELIMINAR SECCIÓN ---

function confirmarEliminarSeccion(id) {
  let modal = document.getElementById("modal-eliminar-seccion-container");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "modal-eliminar-seccion-container";
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
        <div class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[60]">
            <div class="bg-white rounded-lg shadow-xl p-6 w-80 text-center">
                <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                    <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <h3 class="text-lg font-bold text-gray-900 mb-2">¿Eliminar Sección?</h3>
                <p class="text-sm text-gray-500 mb-6">Esta acción marcará la sección ID ${id} como borrada del sistema.</p>
                <div class="flex justify-center space-x-3">
                    <button type="button" onclick="document.getElementById('modal-eliminar-seccion-container').innerHTML=''" 
                            class="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors">
                        Cancelar
                    </button>
                    <button id="btn-confirm-delete-seccion" class="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 shadow-sm transition-colors">
                        Confirmar
                    </button>
                </div>
            </div>
        </div>
    `;

  document.getElementById("btn-confirm-delete-seccion").onclick = async () => {
    try {
      const response = await fetch(`/api/materias/eliminar-seccion`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: id, eliminar: true }),
      });

      if (response.ok) {
        mostrarNotificacion("Registro eliminado correctamente");
        modal.innerHTML = "";
        window.location.reload();
      } else {
        mostrarNotificacion(
          "No tienes permisos para eliminar este registro",
          "error",
        );
      }
    } catch (error) {
      mostrarNotificacion("Error de conexión", "error");
    }
  };
}

// --- FUNCIÓN DE NOTIFICACIÓN ---
function mostrarNotificacion(mensaje, tipo = "exito") {
  const previa = document.getElementById("toast-notificacion");
  if (previa) previa.remove();

  const colorFondo = tipo === "exito" ? "bg-green-600" : "bg-red-600";
  const toast = document.createElement("div");
  toast.id = "toast-notificacion";
  toast.className = `fixed bottom-5 right-5 ${colorFondo} text-white px-6 py-3 rounded-lg shadow-2xl flex items-center space-x-3 transform transition-all duration-500 z-[100] animate-bounce-short`;

  toast.innerHTML = `<span class="font-medium">${mensaje}</span>`;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 500);
  }, 3500);
}

// FUNCION PARA CARGAR MATERIAS DESDE LA API
async function cargarMateriasDinámicas() {
  try {
    const response = await fetch("/api/materias/todas-materias", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const datos = await response.json();

    if (datos.status === "error")
      throw new Error(datos.message || "Error al obtener materias");

    const materiaSelect = document.getElementById("materia_id");
    const semestreSelect = document.getElementById("semestre"); // Necesario para disparar el filtro

    if (!materiaSelect) return;

    // 1. Limpiamos pero mantenemos la opción por defecto
    materiaSelect.innerHTML =
      '<option value="">Seleccione una materia</option>';

    // 2. Llenamos el select con el atributo 'data-semestre'
    datos.materias.map((materia) => {
      const option = document.createElement("option");
      option.value = materia.id;
      option.textContent = materia.nombre;
      option.setAttribute("data-semestre", materia.semestre);
      option.hidden = true;
      option.disabled = true;

      materiaSelect.appendChild(option);
    });

    // 3. IMPORTANTE: Si ya hay un semestre seleccionado al cargar las materias,
    if (semestreSelect && semestreSelect.value) {
      semestreSelect.dispatchEvent(new Event("change"));
    }

    console.log("Materias cargadas y vinculadas por semestre");
  } catch (error) {
    console.error("Error al obtener las materias:", error);
  }
}

cargarMateriasDinámicas();
