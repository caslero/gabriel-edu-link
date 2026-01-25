document.addEventListener("DOMContentLoaded", async () => {
  const semestreSelect = document.getElementById("semestre");
  const materiaSelect = document.getElementById("materia_id");
  const seccionInput = document.getElementById("seccion_nombre");
  const cuposInput = document.getElementById("cupos");

  // --- 1. FUNCIÓN DE FILTRADO ---
  const aplicarFiltroMaterias = () => {
    // Obtenemos el valor actual del select de semestre
    const semestreElegido = semestreSelect.value
      ? semestreSelect.value.toString().trim()
      : "";

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
      const semestreMateria = opt.getAttribute("data-semestre")
        ? opt.getAttribute("data-semestre").toString().trim()
        : "";

      // COMPARACIÓN ESTRICTA
      const coincide = semestreMateria === semestreElegido;

      opt.hidden = !coincide;
      opt.disabled = !coincide;

      if (coincide) materiasVisibles++;
    });

    materiaSelect.disabled = false;
    console.log(
      `Filtro aplicado. Materias encontradas para el semestre ${semestreElegido}: ${materiasVisibles}`,
    );
  };

  // --- 2. CARGA DINÁMICA ---
  // async function cargarMateriasDinamicas() {
  //   try {
  //     const response = await fetch("/api/materias/todas-materias");
  //     const datos = await response.json();

  //     if (datos.status === "ok" && datos.materias) {
  //       // Guardamos el valor que el usuario pudo haber seleccionado mientras cargaba la API
  //       const valorTemporal = materiaSelect.value;

  //       materiaSelect.innerHTML = '<option value="">Seleccione una materia</option>';

  //       datos.materias.forEach((materia) => {
  //         const option = document.createElement("option");
  //         option.value = materia.id;
  //         option.textContent = materia.nombre;
  //         // Inyectamos el semestre que viene de la base de datos
  //         option.setAttribute("data-semestre", materia.semestre);
  //         option.hidden = true;
  //         option.disabled = true;
  //         materiaSelect.appendChild(option);
  //       });

  //       if (valorTemporal) materiaSelect.value = valorTemporal;
  //       console.log("Materias inyectadas desde API correctamente.");
  //     }
  //   } catch (error) {
  //     console.warn("Error en fetch, se mantendrán las materias cargadas por EJS.");
  //   } finally {
  //     // SIEMPRE aplicar el filtro al terminar la carga
  //     aplicarFiltroMaterias();
  //   }
  // }

  // --- 3. EVENTOS ---
  semestreSelect?.addEventListener("change", () => {
    // Al cambiar semestre, reseteamos todo lo de abajo
    materiaSelect.value = "";
    if (seccionInput) {
      seccionInput.value = "";
      seccionInput.disabled = true;
    }
    if (cuposInput) {
      cuposInput.value = "";
      cuposInput.disabled = true;
    }

    aplicarFiltroMaterias();
  });

  materiaSelect?.addEventListener("change", () => {
    const seleccionada = !!materiaSelect.value;
    if (seccionInput) seccionInput.disabled = !seleccionada;
    if (cuposInput) cuposInput.disabled = !seleccionada;
  });
});

// --- MODAL DINÁMICO PARA EDITAR SECCIÓN
function abrirModalEditarSeccion(id, nombre, cupos) {
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
                <div class="flex justify-center mt-4 space-x-2">
                    <button type="button" onclick="document.getElementById('modal-editar-seccion-container').innerHTML=''" 
                            class="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition-colors">
                        Cancelar
                    </button>
                    <button type="submit" class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 shadow-md transition-colors">
                        Guardar Cambios
                    </button>
                </div>
            </form>
        </div>
    </div>`;

  document
    .getElementById("form-editar-seccion")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const info = Object.fromEntries(formData.entries());

      try {
        const response = await fetch(`/api/secciones/actualizar-seccion`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: info.idSeccion,
            nombre: info.nombre,
            cupos: info.cupos,
          }),
        });

        const resultado = await response.json();
        if (response.ok || resultado.status === "ok") {
          mostrarNotificacion("Sección actualizada con éxito");
          window.location.reload();
        } else {
          mostrarNotificacion(
            resultado.message || "Error al actualizar",
            "error",
          );
        }
      } catch (error) {
        mostrarNotificacion("Error de servidor", "error");
      }
    });
}

// --- FUNCIONES DE Eliminar
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
      const response = await fetch(`/api/secciones/eliminar-seccion`, {
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

function mostrarNotificacion(mensaje, tipo = "exito") {
  const color = tipo === "exito" ? "bg-green-600" : "bg-red-600";
  const toast = document.createElement("div");
  toast.className = `fixed bottom-5 right-5 ${color} text-white px-6 py-3 rounded-lg shadow-2xl z-[100]`;
  toast.innerHTML = `<span class="font-medium">${mensaje}</span>`;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

//  funcion para traer todas las materias
async function cargarMateriasDinamicas() {
  try {
    const response = await fetch("/api/materias/todas-materias", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const datos = await response.json();

    if (datos.status === "error")
      throw new Error("Error al obtener las materias");

    const contenedorSemestres = document.getElementById("todos-semestres");
    const contenedorMaterias = document.getElementById("materias-semestre");

    // 1. Eliminar duplicados de materias
    const materiasUnicas = datos.materias.filter(
      (materia, index, self) =>
        index === self.findIndex((m) => m.id === materia.id),
    );

    // Guardar los datos de materias únicas
    window.materiasData = materiasUnicas;

    // 2. Extraer semestres únicos
    const semestresUnicos = [
      ...new Set(materiasUnicas.map((materia) => materia.semestre)),
    ].sort((a, b) => a - b);

    const maxSemestre = Math.max(...semestresUnicos);

    // 3. Crear opciones del 1 al semestre máximo
    const opcionesSemestres = [];
    for (let i = 1; i <= maxSemestre; i++) {
      opcionesSemestres.push(`<option value="${i}">${i}</option>`);
    }

    // Crear el select de semestres
    contenedorSemestres.innerHTML = `
      <label for="semestres" class="block font-semibold text-gray-700">Semestre</label>
      <select id="semestres" name="semestres" class="w-full border p-2 rounded focus:ring-2 focus:ring-blue-400 outline-none" required>
        <option value="">Seleccione</option>
        ${opcionesSemestres.join("")}
      </select>
    `;

    // Inicialmente mostrar mensaje en contenedor de materias
    contenedorMaterias.innerHTML = `
      <label for="materia" class="block font-semibold text-gray-700">Materia</label>
      <select id="materia" name="materia" class="w-full border p-2 rounded" disabled required>
        <option value="">Seleccione</option>
      </select>
    `;

    // Agregar event listener al select de semestres
    document
      .getElementById("semestres")
      .addEventListener("change", function () {
        cargarMateriasPorSemestre(this.value, contenedorMaterias);
      });
  } catch (error) {
    console.error("Error al cargar materias:", error);
    mostrarNotificacion("Error al cargar las materias", "error");
  }
}

// Función para cargar materias por semestre
function cargarMateriasPorSemestre(semestre, contenedorMaterias) {
  if (!semestre) {
    contenedorMaterias.innerHTML = "";
    return;
  }

  // Filtrar materias por semestre
  const materiasDelSemestre = window.materiasData.filter(
    (materia) => materia.semestre == semestre,
  );

  // Eliminar duplicados por nombre
  const materiasSinDuplicados = materiasDelSemestre.filter(
    (materia, index, self) =>
      index === self.findIndex((m) => m.nombre === materia.nombre),
  );

  if (materiasSinDuplicados.length === 0) {
    contenedorMaterias.innerHTML = `
          <label for="materia" class="block font-semibold text-gray-700">Materia</label>
          <select id="materia" name="materia" class="w-full border p-2 rounded" disabled required>
            <option value="">No hay materias para este semestre</option>
          </select>
        `;
    return;
  }

  // Crear opciones de materias
  const opcionesMaterias = materiasSinDuplicados
    .map(
      (materia) => `<option value="${materia.id}">${materia.nombre}</option>`,
    )
    .join("");

  contenedorMaterias.innerHTML = `
        <label for="materia" class="block font-semibold text-gray-700">Materia</label>
        <select id="materia" name="materia" class="w-full border p-2 rounded focus:ring-2 focus:ring-blue-400 outline-none" required>
          <option value="">Seleccione</option>
          ${opcionesMaterias}
        </select>
      `;

  // Habilitar inputs cuando se selecciona una materia
  const selectMateria = document.getElementById("materia");
  const seccionNombreInput = document.getElementById("seccion_nombre");
  const cuposInput = document.getElementById("cupos");

  selectMateria.addEventListener("change", function () {
    if (this.value) {
      seccionNombreInput.disabled = false;
      cuposInput.disabled = false;
    } else {
      seccionNombreInput.disabled = true;
      cuposInput.disabled = true;
    }
  });
}

// Llamar a la función cuando se cargue la página
document.addEventListener("DOMContentLoaded", cargarMateriasDinamicas);

// LISTAR SECCIONES REGISTRADAS
async function listarSecciones() {
  try {
    const response = await fetch("/api/secciones/todas-secciones", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const datos = await response.json();
    const tbody = document.getElementById("tabla-secciones-body");
    if (!tbody) return;

    tbody.innerHTML = "";

    // 1. Caso: Sin datos (Estilo similar al de usuarios)
    if (!datos.secciones || datos.secciones.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center py-6 text-gray-500">
            No hay secciones registradas.
          </td>
        </tr>`;
      return;
    }

    // 2. Caso: Listado de secciones
    datos.secciones.forEach((sec) => {
      const fila = document.createElement("tr");
      // Mismo hover y bordes que la tabla de usuarios
      fila.className = "hover:bg-gray-50 transition-colors border-b";

      fila.innerHTML = `
        <td class="px-4 py-2 text-center text-gray-600 font-medium">#${sec.id}</td>
        <td class="px-4 py-2 text-center font-semibold">${sec.semestre}°</td>
        <td class="px-4 py-2 text-center text-sm">${sec.materia_nombre}</td>
        <td class="px-4 py-2 text-center">
          <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-bold uppercase">
            ${sec.seccion_nombre}
          </span>
        </td>
        <td class="px-4 py-2 text-center">
          <span class="font-bold text-green-700">${sec.cupos || 0}</span>
        </td>
        <td class="px-4 py-2 text-center text-gray-500 text-xs">
          ${sec.usuario_nombre || "Sin docente"}
        </td>
        <td class="px-4 py-2 text-center space-x-2">
          <button onclick="abrirModalEditarSeccion('${sec.id}', '${sec.seccion_nombre}', '${sec.materia_id}', '${sec.cupos}')" 
                  class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded transition duration-200 text-sm">
            Editar
          </button>
          
          <button onclick="confirmarEliminarSeccion('${sec.id}')" 
                  class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition duration-200 text-sm">
            Eliminar
          </button>
        </td>
      `;
      tbody.appendChild(fila);
    });
  } catch (error) {
    console.error("Error al listar secciones:", error);
  }
}

document.addEventListener("DOMContentLoaded", listarSecciones);

// FUNCION PARA CREAR SECCIONES
async function registrarNuevaSeccion(e) {
  e.preventDefault();

  const form = e.target;
  const selectMateria = document.getElementById("materia");
  const inputSeccion = document.getElementById("seccion_nombre");
  const inputCupos = document.getElementById("cupos");

  const payload = {
    materia_id: selectMateria.value,
    seccion_nombre: inputSeccion.value.trim(),
    cupos: parseInt(inputCupos.value),
  };

  if (!payload.materia_id || !payload.seccion_nombre || isNaN(payload.cupos)) {
    mostrarNotificacion(
      "Por favor, completa todos los campos correctamente",
      "error",
    );
    return;
  }

  try {
    const response = await fetch("/api/secciones/crear-seccion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    // --- DATOS RECIBIDOS DEL SERVIDOR (RESPONSE) ---
    // Se espera un objeto con: { status: "ok", message: "...", id: ... }
    const resultado = await response.json();

    if (response.ok || resultado.status === "ok") {
      mostrarNotificacion("Sección registrada con éxito");
      form.reset();
      inputSeccion.disabled = true;
      inputCupos.disabled = true;

      if (typeof listarSecciones === "function") {
        await listarSecciones();
      } else {
        setTimeout(() => window.location.reload(), 1500);
      }
    } else {
      mostrarNotificacion(resultado.message || "Error al registrar", "error");
    }
  } catch (error) {
    console.error("Error en la petición:", error);
    mostrarNotificacion("Error de conexión", "error");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const formRegistro = document.getElementById("formRegistroSeccion");
  if (formRegistro) {
    formRegistro.addEventListener("submit", registrarNuevaSeccion);
  }
});
