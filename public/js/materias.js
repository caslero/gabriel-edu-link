document.addEventListener("DOMContentLoaded", async () => {
  const semestreSelect = document.getElementById("semestre");
  const materiaSelect = document.getElementById("materia_id");
  const seccionInput = document.getElementById("seccion_nombre");
  const cuposInput = document.getElementById("cupos");

  // --- 1. FUNCIÓN DE FILTRADO ---
  const aplicarFiltroMaterias = () => {
    // Obtenemos el valor actual del select de semestre
    const semestreElegido = semestreSelect.value ? semestreSelect.value.toString().trim() : "";
    
    console.log("Ejecutando filtro para semestre:", semestreElegido);

    // Si no hay semestre, deshabilitamos el select de materias
    if (!semestreElegido) {
      materiaSelect.disabled = true;
      materiaSelect.value = "";
      return;
    }

    const opciones = materiaSelect.querySelectorAll("option");
    let materiasVisibles = 0;

    opciones.forEach((opt) => {
      if (!opt.value) return; // Saltar el "Seleccione..."

      // Leemos el atributo que pusimos en el EJS o en la carga dinámica
      const semestreMateria = opt.getAttribute("data-semestre") ? opt.getAttribute("data-semestre").toString().trim() : "";
      
      // COMPARACIÓN ESTRICTA
      const coincide = (semestreMateria === semestreElegido);

      opt.hidden = !coincide;
      opt.disabled = !coincide;
      
      if (coincide) materiasVisibles++;
    });

    materiaSelect.disabled = false;
    console.log(`Filtro aplicado. Materias encontradas para el semestre ${semestreElegido}: ${materiasVisibles}`);
  };

  // --- 2. CARGA DINÁMICA ---
  async function cargarMateriasDinámicas() {
    try {
      const response = await fetch("/api/materias/todas-materias");
      const datos = await response.json();

      if (datos.status === "ok" && datos.materias) {
        // Guardamos el valor que el usuario pudo haber seleccionado mientras cargaba la API
        const valorTemporal = materiaSelect.value;

        materiaSelect.innerHTML = '<option value="">Seleccione una materia</option>';

        datos.materias.forEach((materia) => {
          const option = document.createElement("option");
          option.value = materia.id;
          option.textContent = materia.nombre;
          // Inyectamos el semestre que viene de la base de datos
          option.setAttribute("data-semestre", materia.semestre);
          option.hidden = true;
          option.disabled = true;
          materiaSelect.appendChild(option);
        });

        if (valorTemporal) materiaSelect.value = valorTemporal;
        console.log("Materias inyectadas desde API correctamente.");
      }
    } catch (error) {
      console.warn("Error en fetch, se mantendrán las materias cargadas por EJS.");
    } finally {
      // SIEMPRE aplicar el filtro al terminar la carga
      aplicarFiltroMaterias();
    }
  }

  // --- 3. EVENTOS ---
  semestreSelect?.addEventListener("change", () => {
    // Al cambiar semestre, reseteamos todo lo de abajo
    materiaSelect.value = "";
    if (seccionInput) { seccionInput.value = ""; seccionInput.disabled = true; }
    if (cuposInput) { cuposInput.value = ""; cuposInput.disabled = true; }
    
    aplicarFiltroMaterias();
  });

  materiaSelect?.addEventListener("change", () => {
    const seleccionada = !!materiaSelect.value;
    if (seccionInput) seccionInput.disabled = !seleccionada;
    if (cuposInput) cuposInput.disabled = !seleccionada;
  });

  // Ejecución inicial
  await cargarMateriasDinámicas();
});


// --- MODAL DINÁMICO PARA EDITAR SECCIÓN (Incluye Cupos) ---

function abrirModalEditarSeccion(id, nombre, materiaId, cupos) {
  let modal = document.getElementById("modal-editar-seccion-container");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "modal-editar-seccion-container";
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div class="bg-white rounded-lg shadow-lg p-6 w-96 text-left">
            <h3 class="text-lg font-semibold text-blue-700 mb-4">Actualizar Sección</h3>
            <form id="form-editar-seccion" class="space-y-3">
                <input type="hidden" name="idSeccion" value="${id}">
                <div>
                    <label class="block text-sm font-semibold text-gray-600">Nombre de la Sección</label>
                    <input type="text" name="nombre" value="${nombre}" class="w-full border p-2 rounded focus:ring-2 focus:ring-blue-400 outline-none" required>
                </div>
                <div>
                    <label class="block text-sm font-semibold text-gray-600">Cupos</label>
                    <input type="number" name="cupos" value="${cupos || 0}" class="w-full border p-2 rounded focus:ring-2 focus:ring-blue-400 outline-none" required>
                </div>
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
    </div>`;

  document.getElementById("form-editar-seccion").addEventListener("submit", async (e) => {
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
          cupos: info.cupos
        }),
      });

      const resultado = await response.json();
      if (response.ok || resultado.status === "ok") {
        mostrarNotificacion("Sección actualizada con éxito");
        window.location.reload();
      } else {
        mostrarNotificacion(resultado.message || "Error al actualizar", "error");
      }
    } catch (error) {
      mostrarNotificacion("Error de servidor", "error");
    }
  });
}

// --- FUNCIONES DE APOYO (Eliminar, Notificar, Cargar) ---

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
            <h3 class="text-lg font-bold text-gray-900 mb-2">¿Eliminar Sección?</h3>
            <p class="text-sm text-gray-500 mb-6">ID de sección: ${id}</p>
            <div class="flex justify-center space-x-3">
                <button type="button" onclick="document.getElementById('modal-eliminar-seccion-container').innerHTML=''" class="bg-gray-200 px-4 py-2 rounded-md">Cancelar</button>
                <button id="btn-confirm-delete-seccion" class="bg-red-600 text-white px-4 py-2 rounded-md">Confirmar</button>
            </div>
        </div>
    </div>`;

  document.getElementById("btn-confirm-delete-seccion").onclick = async () => {
    try {
      const response = await fetch(`/api/materias/eliminar-seccion`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: id, eliminar: true }),
      });
      if (response.ok) {
        window.location.reload();
      } else {
        mostrarNotificacion("Error al eliminar", "error");
      }
    } catch (error) {
      mostrarNotificacion("Error de conexión", "error");
    }
  };
}

async function cargarMateriasDinámicas() {
  try {
    const response = await fetch("/api/materias/todas-materias");
    const datos = await response.json();
    const materiaSelect = document.getElementById("materia_id");
    const semestreSelect = document.getElementById("semestre");

    if (!materiaSelect || datos.status === "error") return;

    materiaSelect.innerHTML = '<option value="">Seleccione una materia</option>';

    datos.materias.forEach((materia) => {
      const option = document.createElement("option");
      option.value = materia.id;
      option.textContent = materia.nombre;
      option.setAttribute("data-semestre", materia.semestre);
      option.hidden = true;
      option.disabled = true;
      materiaSelect.appendChild(option);
    });

    if (semestreSelect?.value) {
      semestreSelect.dispatchEvent(new Event("change"));
    }
  } catch (error) {
    console.error("Error al cargar materias:", error);
  }
}

function mostrarNotificacion(mensaje, tipo = "exito") {
  const color = tipo === "exito" ? "bg-green-600" : "bg-red-600";
  const toast = document.createElement("div");
  toast.className = `fixed bottom-5 right-5 ${color} text-white px-6 py-3 rounded-lg shadow-2xl z-[100]`;
  toast.innerHTML = `<span class="font-medium">${mensaje}</span>`;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}
