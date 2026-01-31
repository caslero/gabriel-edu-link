document.addEventListener("DOMContentLoaded", () => {
  // --- 1. REFERENCIAS ---
  const selectSemestre = document.getElementById("semestre_id");
  const selectMateria = document.getElementById("materia_id");
  const selectSeccion = document.getElementById("seccion_id");
  const formManual = document.querySelector("form.grid");

  const buscarCedula = document.getElementById("buscarCedula");
  const btnBuscarCedula = document.getElementById("btnBuscarCedula");
  const selectEstudiante = document.getElementById("estudiante_id");
  const prefijoCedula = document.getElementById("prefijoCedula");

  // --- 2. CARGA INICIAL DE SEMESTRES ---
  const cargarSemestres = async () => {
    try {
      const res = await fetch("/api/inscripcion/semestres", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      // Cambiamos 'data.datos.semestres' por 'data.semestres'
      if (data.status === "ok" && data.semestres) {
        const semestres = data.semestres;

        const selectSemestre = document.getElementById("semestre_id");

        // Limpiar y añadir opción por defecto
        selectSemestre.innerHTML =
          '<option value="">Selecciona el Semestre</option>';

        semestres.forEach((item) => {
          const option = document.createElement("option");
          // Según tu modelo, el campo se llama 'semestre'
          option.value = item.semestre;
          option.textContent = `Semestre ${item.semestre}`;
          selectSemestre.appendChild(option);
        });

        console.log("Select de semestres poblado con éxito.");
      }
    } catch (err) {
      console.error("Error cargando semestres:", err);
    }
  };

  // Inicializaciones
  cargarSemestres();
  listarInscripcionesConfirmadas();
  configurarFormulariosModales();

  // --- 3. BÚSQUEDA DE ESTUDIANTE (POST) ---
  const realizarBusqueda = async () => {
    const cedula = buscarCedula.value.trim();
    const paisValor = prefijoCedula.value === "1" ? "V" : "E";

    if (!cedula) return mostrarNotificacion("Ingrese una cédula", "error");

    try {
      const res = await fetch("/api/inscripcion/buscar-estudiante", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ cedula, pais: paisValor }),
      });

      const data = await res.json();

      if (data.status === "ok" && data.estudiante) {
        selectEstudiante.innerHTML = `<option value="${data.estudiante.id}">${data.estudiante.nombre} (${paisValor}-${cedula})</option>`;
        selectEstudiante.value = data.estudiante.id;
        selectEstudiante.disabled = false;

        if (selectSemestre) selectSemestre.disabled = false;
        mostrarNotificacion("Estudiante encontrado");
      } else {
        mostrarNotificacion(
          data.message || "Estudiante no registrado",
          "error",
        );
        resetSelect(selectEstudiante, "Realice una búsqueda...");
      }
    } catch (err) {
      console.error("Error:", err);
      mostrarNotificacion("Error de conexión", "error");
    }
  };

  // Asignación de eventos de búsqueda
  if (btnBuscarCedula) btnBuscarCedula.onclick = realizarBusqueda;
  if (buscarCedula) {
    buscarCedula.onkeypress = (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        realizarBusqueda();
      }
    };
  }

  // --- 4. FILTRADO DE SELECTS (Versión adaptada para nombres únicos) ---
  if (selectSemestre) {
    selectSemestre.addEventListener("change", async (e) => {
      const semestreId = e.target.value;

      // Reset inicial de los selectores dependientes
      resetSelect(selectMateria, "Selecciona la Materia");
      resetSelect(selectSeccion, "Selecciona la Sección");

      if (!semestreId) return;

      try {
        const res = await fetch(
          `/api/inscripcion/materias?semestre=${semestreId}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          },
        );

        const data = await res.json();

        if (data.status === "ok" && Array.isArray(data.materias)) {
          selectMateria.innerHTML =
            '<option value="">Selecciona la Materia</option>';

          // Usamos el nombre de la materia como 'value' para evitar duplicados visuales
          data.materias.forEach((materia) => {
            const option = document.createElement("option");
            option.value = materia.nombre; // <-- Cambiamos ID por NOMBRE
            option.textContent = materia.nombre;
            selectMateria.appendChild(option);
          });

          selectMateria.disabled = false;
        } else {
          resetSelect(selectMateria, "No hay materias disponibles");
        }
      } catch (err) {
        console.error("Error cargando materias:", err);
      }
    });
  }

  if (selectMateria) {
    selectMateria.addEventListener("change", async (e) => {
      const nombreMateria = e.target.value;

      // Limpiamos el select de secciones y lo deshabilitamos mientras carga
      resetSelect(selectSeccion, "Selecciona la Sección");

      if (!nombreMateria) return;

      try {
        // Petición a la ruta que definiste
        const res = await fetch(
          `/api/inscripcion/secciones?nombreMateria=${encodeURIComponent(nombreMateria)}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          },
        );

        const data = await res.json();

        if (data.status === "ok" && Array.isArray(data.secciones)) {
          selectSeccion.innerHTML =
            '<option value="">Selecciona la Sección</option>';

          data.secciones.forEach((sec) => {
            const option = document.createElement("option");
            option.value = sec.id; // IMPORTANTE: El value es el ID de la sección para la inscripción
            option.textContent = `${sec.seccion_nombre} (Cupos: ${sec.cupos})`;
            selectSeccion.appendChild(option);
          });

          selectSeccion.disabled = false;
        } else {
          resetSelect(selectSeccion, "Sin secciones disponibles");
        }
      } catch (err) {
        console.error("Error cargando secciones:", err);
        mostrarNotificacion("Error al conectar con el servidor", "error");
      }
    });
  }

  // --- 5. ENVÍO DE INSCRIPCIÓN MANUAL (Corregido) ---
  if (formManual) {
    formManual.addEventListener("submit", async (e) => {
      e.preventDefault();

      // Obtenemos los valores
      const estudianteId = parseInt(
        document.getElementById("id_estudiante_hidden")?.value ||
          selectEstudiante?.value,
      );
      const seccionId = parseInt(selectSeccion.value);

      // Creamos el payload asegurando que los tipos de datos sean correctos
      const payload = {
        estudiante_id: estudianteId,
        seccion_id: seccionId,
      };

      // Validación visual antes de enviar
      if (!payload.estudiante_id || isNaN(payload.estudiante_id)) {
        return mostrarNotificacion(
          "Debe buscar un estudiante primero",
          "error",
        );
      }
      if (!payload.seccion_id || isNaN(payload.seccion_id)) {
        return mostrarNotificacion("Debe seleccionar una sección", "error");
      }

      try {
        const res = await fetch("/api/inscripcion/crear-inscripcion", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();

        if (data.status === "ok") {
          mostrarNotificacion("¡Inscripción exitosa!");
          setTimeout(() => window.location.reload(), 1500);
        } else {
          // Aquí capturamos el mensaje del validador (ej. "Ya está inscrito")
          mostrarNotificacion(data.message || "Error al inscribir", "error");
        }
      } catch (err) {
        console.error("Error:", err);
        mostrarNotificacion("Error de conexión con el servidor", "error");
      }
    });
  }
});

// --- FUNCIONES PARA GESTIÓN DE SOLICITUDES (MODALES) ---

function toggleModal(modalId, show) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  show ? modal.classList.remove("hidden") : modal.classList.add("hidden");
}

// Configura los formularios de Aprobar/Rechazar dentro de los modales generados por EJS
function configurarFormulariosModales() {
  const formularios = document.querySelectorAll('div[id^="modal-"] form');
  formularios.forEach((form) => {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const modalDiv = form.closest('div[id^="modal-"]');
      const solicitudId = modalDiv.id.split("-")[1];
      const formData = new FormData(form);

      const payload = {
        estado: formData.get("estado"),
        comentario: formData.get("comentario") || "Aprobado por administración",
      };

      try {
        const res = await fetch(`/api/inscripcion/gestionar/${solicitudId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.status === "ok") {
          mostrarNotificacion(data.message);
          setTimeout(() => location.reload(), 1000);
        } else {
          mostrarNotificacion(data.message, "error");
        }
      } catch (error) {
        mostrarNotificacion("Error de conexión", "error");
      }
    });
  });
}

// --- FUNCIONES DE APOYO ---

async function listarInscripcionesConfirmadas() {
  try {
    const res = await fetch("/api/inscripcion/confirmadas", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();
    const tbody = document.querySelector("#tabla-confirmadas-body");
    if (!tbody || data.status !== "ok") return;

    if (!data.inscripciones || data.inscripciones.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="text-center py-6 text-gray-400 italic">No hay registros confirmados</td></tr>`;
      return;
    }

    tbody.innerHTML = data.inscripciones
      .map(
        (ins) => `
            <tr class="text-sm border-b hover:bg-gray-50">
                <td class="px-4 py-2 text-center text-gray-400">${ins.id}</td>
                <td class="px-4 py-2 text-center font-medium">${ins.estudiante_nombre} <br><small class="text-blue-600">${ins.id_usuario}</small></td>
                <td class="px-4 py-2 text-center">${ins.materia}</td>
                <td class="px-4 py-2 text-center"><span class="bg-gray-100 px-2 py-1 rounded">${ins.seccion}</span></td>
                <td class="px-4 py-2 text-center text-xs text-gray-500">${ins.creado_en}</td>
            </tr>`,
      )
      .join("");
  } catch (e) {
    console.error(e);
  }
}

function filtrarOpcionesLocales(select, dataAttr, valor) {
  if (!select) return;
  let visibles = 0;
  Array.from(select.options).forEach((opt) => {
    if (!opt.value) return;
    const coincide = opt.getAttribute(dataAttr) === String(valor);
    opt.hidden = !coincide;
    opt.disabled = !coincide;
    if (coincide) visibles++;
  });
  if (visibles === 0) resetSelect(select, "No hay opciones");
}

function resetSelect(select, texto) {
  if (!select) return;
  select.value = "";
  select.disabled = true;
  if (select.options[0]) select.options[0].textContent = texto;
}

function mostrarNotificacion(mensaje, tipo = "exito") {
  const previa = document.getElementById("toast-notificacion");
  if (previa) previa.remove();
  const color = tipo === "exito" ? "bg-green-600" : "bg-red-600";
  const toast = document.createElement("div");
  toast.id = "toast-notificacion";
  toast.className = `fixed bottom-5 right-5 ${color} text-white px-6 py-3 rounded-lg shadow-2xl z-[100] transition-all`;
  toast.innerHTML = `<span class="font-medium">${mensaje}</span>`;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 500);
  }, 3000);
}

document.addEventListener("DOMContentLoaded", () => {
  const formInscripcion = document.querySelector("form.space-y-4");
  const selectSemestre = document.getElementById("semestre");
  const selectMateria = document.getElementById("materia_id");
  const selectSeccion = document.getElementById("seccion_id");

  // --- 1. FILTRADO DINÁMICO: Semestre -> Materia ---
  selectSemestre?.addEventListener("change", () => {
    const semestreSeleccionado = selectSemestre.value;

    // Reset de hijos
    selectMateria.value = "";
    selectSeccion.value = "";
    selectSeccion.disabled = true;

    if (!semestreSeleccionado) {
      selectMateria.disabled = true;
      return;
    }

    selectMateria.disabled = false;
    Array.from(selectMateria.options).forEach((opt) => {
      if (opt.value === "") return;
      // Mostramos solo materias que coincidan con el dataset semestre
      opt.hidden = opt.dataset.semestre !== semestreSeleccionado;
    });
  });

  // --- 2. FILTRADO DINÁMICO: Materia -> Sección ---
  selectMateria.addEventListener("change", () => {
    const materiaSeleccionada = selectMateria.value;

    selectSeccion.value = "";
    if (!materiaSeleccionada) {
      selectSeccion.disabled = true;
      return;
    }

    selectSeccion.disabled = false;
    Array.from(selectSeccion.options).forEach((opt) => {
      if (opt.value === "") return;
      // Mostramos secciones según el dataset materia
      opt.hidden = opt.dataset.materia !== materiaSeleccionada;
    });
  });

  // --- 3. ENVÍO DE SOLICITUD ---
  if (formInscripcion) {
    formInscripcion.addEventListener("submit", async (e) => {
      e.preventDefault();

      const formData = new FormData(formInscripcion);
      const payload = Object.fromEntries(formData.entries());

      // Validación extra
      if (!payload.seccion_id) {
        return mostrarNotificacion("Debe seleccionar una sección", "error");
      }

      try {
        // Ajusta esta URL a tu endpoint de solicitudes de estudiante
        const res = await fetch("/api/inscripcion/solicitar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();

        if (data.status === "ok") {
          mostrarNotificacion("Solicitud enviada con éxito");
          setTimeout(() => location.reload(), 1500);
        } else {
          mostrarNotificacion(data.message || "Error al procesar", "error");
        }
      } catch (err) {
        console.error("Error:", err);
        mostrarNotificacion("Error de conexión al servidor", "error");
      }
    });
  }
});

// --- UTILIDAD: NOTIFICACIONES ---
function mostrarNotificacion(mensaje, tipo = "exito") {
  const color = tipo === "exito" ? "bg-green-600" : "bg-red-600";
  const previa = document.getElementById("toast-estudiante");
  if (previa) previa.remove();

  const toast = document.createElement("div");
  toast.id = "toast-estudiante";
  toast.className = `fixed bottom-5 right-5 ${color} text-white px-6 py-3 rounded-lg shadow-2xl z-[100] transition-opacity duration-500`;
  toast.innerHTML = `<span class="font-medium">${mensaje}</span>`;

  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 500);
  }, 3000);
}

// Hacer toggleModal global para los onclick del HTML
window.toggleModal = toggleModal;
