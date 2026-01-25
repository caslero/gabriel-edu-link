document.addEventListener('DOMContentLoaded', () => {
    // --- 1. REFERENCIAS ---
    const selectSemestre = document.getElementById('semestre_id');
    const selectMateria = document.getElementById('materia_id');
    const selectSeccion = document.getElementById('seccion_id');
    const formManual = document.querySelector('form.grid');

    const buscarCedula = document.getElementById('buscarCedula');
    const btnBuscarCedula = document.getElementById('btnBuscarCedula');
    const selectEstudiante = document.getElementById('estudiante_id');
    const prefijoCedula = document.getElementById('prefijoCedula');

    // Cargar la tabla de confirmadas al iniciar
    listarInscripcionesConfirmadas();

    // --- 2. BÚSQUEDA DE ESTUDIANTE ---
    if (btnBuscarCedula && buscarCedula) {
        const realizarBusqueda = async () => {
            const cedula = buscarCedula.value.trim();
            const pais = prefijoCedula.value === "1" ? "V" : "E"; // 'pais' es la letra
            
            if (!cedula) return mostrarNotificacion("Ingrese una cédula", "error");

            try {
                const res = await fetch(`/api/inscripciones/buscar-estudiante
                    ?cedula=${cedula}
                    &letra=${pais}`);
                const data = await res.json();

                if (data.status === "ok" && data.estudiante) {
                    // CORRECCIÓN: Usamos 'pais' para que no de error de variable no definida
                    selectEstudiante.innerHTML = `<option value="${data.estudiante.id}">${data.estudiante.nombre} (${pais}-${cedula})</option>`;
                    selectEstudiante.disabled = false;
                    selectSemestre.disabled = false;
                    mostrarNotificacion("Estudiante encontrado");
                } else {
                    mostrarNotificacion(data.message || "Estudiante no registrado", "error");
                    resetSelect(selectEstudiante, "Realice una búsqueda...");
                    selectSemestre.disabled = true;
                }
            } catch (err) {
                mostrarNotificacion("Error de conexión", "error");
            }
        };

        btnBuscarCedula.addEventListener('click', realizarBusqueda);
    }

    // --- 3. FILTRADO LOCAL (Tus funciones originales) ---
    if (selectSemestre) {
        selectSemestre.addEventListener('change', () => {
            resetSelect(selectMateria, "Selecciona la Materia");
            resetSelect(selectSeccion, "Selecciona la Sección");
            if (!selectSemestre.value) return;
            filtrarOpcionesLocales(selectMateria, 'data-semestre', selectSemestre.value);
            selectMateria.disabled = false;
        });
    }

    if (selectMateria) {
        selectMateria.addEventListener('change', () => {
            resetSelect(selectSeccion, "Selecciona la Sección");
            if (!selectMateria.value) return;
            filtrarOpcionesLocales(selectSeccion, 'data-materia', selectMateria.value);
            selectSeccion.disabled = false;
        });
    }

    // --- 4. ENVÍO REGISTRO MANUAL ---
    if (formManual) {
        formManual.addEventListener('submit', async (e) => {
            e.preventDefault();
            const payload = {
                estudiante_id: selectEstudiante.value,
                semestre_id: selectSemestre.value,
                materia_id: selectMateria.value,
                seccion_id: selectSeccion.value
            };
            if (!payload.seccion_id) return mostrarNotificacion("Complete todos los campos", "error");

            try {
                const res = await fetch('/api/inscripciones/crear-inscripcion', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const data = await res.json();
                if (data.status === "ok") {
                    mostrarNotificacion("Inscripción exitosa");
                    setTimeout(() => window.location.reload(), 1500);
                } else {
                    mostrarNotificacion(data.message, "error");
                }
            } catch (err) {
                mostrarNotificacion("Error de red", "error");
            }
        });
    }
});

// --- FUNCIONES DE SOPORTE (RESTAURADAS Y CORREGIDAS) ---

function filtrarOpcionesLocales(select, dataAttr, valor) {
    if (!select) return;
    let visibles = 0;
    Array.from(select.options).forEach(opt => {
        if (!opt.value) return; 
        const coincide = opt.getAttribute(dataAttr) === String(valor);
        opt.hidden = !coincide;
        opt.disabled = !coincide;
        if(coincide) visibles++;
    });
    if (visibles === 0) resetSelect(select, "No hay opciones");
}

function resetSelect(select, texto) {
    if (!select) return;
    select.value = "";
    select.disabled = true;
    if (select.options[0]) select.options[0].textContent = texto;
}

function toggleModal(id, show) {
    const modal = document.getElementById(id);
    if (modal) show ? modal.classList.remove('hidden') : modal.classList.add('hidden');
}

async function aprobarSolicitud(solicitudId) {
    if (!confirm('¿Está seguro de aprobar esta inscripción?')) return;
    try {
        const res = await fetch(`/api/inscripciones/gestionar/${solicitudId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estado: 'Aprobada', comentario: 'Inscripción aprobada por el administrador.' })
        });
        const data = await res.json();
        if (data.status === 'ok') { alert('Aprobada'); location.reload(); }
    } catch (error) { alert('Error de conexión'); }
}

async function listarInscripcionesConfirmadas() {
    try {
        const res = await fetch("/api/inscripciones/confirmadas");
        const data = await res.json();
        // Selector corregido para buscar el tbody dentro del contenedor de confirmadas
        const tbody = document.querySelector("#tabla-confirmadas-body"); 
        if (!tbody || data.status !== "ok") return;

        if (data.inscripciones.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="text-center py-6 text-gray-400">Sin registros</td></tr>`;
            return;
        }

        tbody.innerHTML = data.inscripciones.map(ins => `
            <tr class="text-sm border-b hover:bg-gray-50">
                <td class="px-4 py-2 text-center text-gray-400">${ins.id}</td>
                <td class="px-4 py-2">${ins.estudiante_nombre}</td>
                <td class="px-4 py-2">${ins.materia}</td>
                <td class="px-4 py-2 text-center">${ins.seccion}</td>
                <td class="px-4 py-2 text-center text-xs">${ins.creado_en}</td>
            </tr>`).join("");
    } catch (e) { console.error("Error tabla:", e); }
}

// 1. Maneja la visibilidad de los modales (Interfaz)
function toggleModal(id, show) {
    const modal = document.getElementById(id);
    if (modal) {
        if (show) {
            modal.classList.remove('hidden');
            modal.classList.add('flex'); // Asegura que se centre si usas flex
        } else {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
    }
}

// 2. Maneja el estado de los selectores (Limpieza de datos en UI)
function resetSelect(select, texto) {
    if (!select) return;
    select.value = "";
    select.disabled = true;
    // Modifica el texto de la primera opción (el placeholder)
    if (select.options[0]) select.options[0].textContent = texto;
}

// 3. LA NUEVA FUNCIÓN POST: Maneja la aprobación y notificaciones Tailwind
async function aprobarSolicitud(solicitudId) {
    // Confirmación nativa antes de procesar datos sensibles
    if (!confirm('¿Está seguro de aprobar esta inscripción?')) return;

    // Datos que se envían al servidor
    const payload = { 
        estado: 'Aprobada', 
        comentario: 'Inscripción aprobada por el administrador.' 
    };

    try {
        const res = await fetch(`/api/inscripciones/gestionar/${solicitudId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (data.status === 'ok') {
            // USANDO TU NOTIFICACIÓN TAILWIND
            mostrarNotificacion("¡Solicitud aprobada con éxito!", "exito");
            
            // Recarga la página después de un breve delay para que vean el mensaje
            setTimeout(() => location.reload(), 1500);
        } else {
            mostrarNotificacion(data.message || "Error al aprobar", "error");
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarNotificacion("Error de conexión con el servidor", "error");
    }
}

function mostrarNotificacion(mensaje, tipo = 'exito') {
    const previa = document.getElementById('toast-notificacion');
    if (previa) previa.remove();

    const colorFondo = tipo === 'exito' ? 'bg-green-600' : 'bg-red-600';
    const icono = tipo === 'exito' 
        ? '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>'
        : '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>';

    const toast = document.createElement('div');
    toast.id = 'toast-notificacion';
    toast.className = `fixed bottom-5 right-5 ${colorFondo} text-white px-6 py-3 rounded-lg shadow-2xl flex items-center space-x-3 transform transition-all duration-500 z-[100] translate-y-0 opacity-100`;
    
    toast.innerHTML = `
        <span>${icono}</span>
        <span class="font-medium">${mensaje}</span>
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-10');
        setTimeout(() => toast.remove(), 500);
    }, 3500);
}