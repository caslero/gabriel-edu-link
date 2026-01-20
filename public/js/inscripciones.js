document.addEventListener('DOMContentLoaded', () => {
    // --- 1. REFERENCIAS DE SELECTORES (REGISTRO MANUAL) ---
    const selectSemestre = document.getElementById('semestre_id');
    const selectMateria = document.getElementById('materia_id');
    const selectSeccion = document.getElementById('seccion_id');
    const formManual = document.querySelector('form.grid'); // El formulario de arriba

    // Referencias Búsqueda Estudiante
    const buscarCedula = document.getElementById('buscarCedula');
    const btnBuscarCedula = document.getElementById('btnBuscarCedula');
    const selectEstudiante = document.getElementById('estudiante_id');

    // --- 2. LÓGICA DE BÚSQUEDA DE ESTUDIANTE ---
    if (btnBuscarCedula && buscarCedula) {
        const realizarBusqueda = async () => {
            const prefijo = document.getElementById('prefijoCedula').value;
            const cedula = buscarCedula.value.trim();
            if (!cedula) return mostrarNotificacion("Ingrese una cédula", "error");

            try {
                // prefijo '1' es V, '0' es E
                const letra = prefijo === "1" ? "V" : "E";
                const res = await fetch(`/api/inscripciones/buscar-estudiante`);
                const data = await res.json();

                if (data.status === "ok") {
                    selectEstudiante.innerHTML = `<option value="${data.estudiante.id}">${data.estudiante.nombre} (${letra}-${cedula})</option>`;
                    selectEstudiante.disabled = false;
                    selectSemestre.disabled = false;
                    mostrarNotificacion("Estudiante encontrado");
                } else {
                    mostrarNotificacion(data.message, "error");
                    resetSelect(selectEstudiante, "Realice una búsqueda...");
                    selectSemestre.disabled = true;
                }
            } catch (err) {
                mostrarNotificacion("Error al conectar con el servidor", "error");
            }
        };

        btnBuscarCedula.addEventListener('click', realizarBusqueda);
        buscarCedula.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); realizarBusqueda(); } });
    }

    // --- 3. FILTRADO EN CASCADA (LOCAL) ---
    if (selectSemestre) {
        selectSemestre.addEventListener('change', () => {
            resetSelect(selectMateria, "Selecciona la Materia");
            resetSelect(selectSeccion, "Selecciona la Sección");
            if (!selectSemestre.value) return;
            
            // Filtramos las materias que pertenecen al semestre seleccionado
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
            const formData = new FormData(formManual);
            const payload = Object.fromEntries(formData.entries());

            try {
                const res = await fetch('/api/inscripciones/crear-inscripcion', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const data = await res.json();

                if (data.status === "ok") {
                    mostrarNotificacion("Inscripción realizada con éxito");
                    setTimeout(() => window.location.reload(), 1500);
                } else {
                    mostrarNotificacion(data.message, "error");
                }
            } catch (err) {
                mostrarNotificacion("Error de red", "error");
            }
        });
    }

    // --- 5. GESTIÓN DE SOLICITUDES (APROBAR/RECHAZAR EN MODALES) ---
    // Buscamos todos los formularios dentro de los modales de solicitudes
    document.querySelectorAll('div[id^="modal-"] form').forEach(form => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const modalId = form.closest('div[id^="modal-"]').id;
            const solicitudId = modalId.replace('modal-', '');
            
            const formData = new FormData(form);
            const info = Object.fromEntries(formData.entries());
            info.solicitud_id = solicitudId;

            try {
                const res = await fetch('/api/inscripciones/gestionar-solicitud', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(info)
                });
                const data = await res.json();

                if (data.status === "ok") {
                    mostrarNotificacion(`Solicitud ${info.estado} correctamente`);
                    toggleModal(modalId, false);
                    setTimeout(() => window.location.reload(), 1000);
                } else {
                    mostrarNotificacion(data.message, "error");
                }
            } catch (err) {
                mostrarNotificacion("Error al procesar la solicitud", "error");
            }
        });
    });
});

// --- FUNCIONES GLOBALES ---

function toggleModal(id, show) {
    const modal = document.getElementById(id);
    if (!modal) return;
    if (show) {
        modal.classList.remove('hidden');
    } else {
        modal.classList.add('hidden');
    }
}

function filtrarOpcionesLocales(select, dataAttr, valor) {
    if (!select) return;
    Array.from(select.options).forEach(opt => {
        if (!opt.value) return; 
        const coincide = opt.getAttribute(dataAttr) === valor;
        opt.hidden = !coincide;
        opt.disabled = !coincide;
    });
}

function resetSelect(select, texto) {
    if (!select) return;
    select.innerHTML = `<option value="">${texto}</option>`;
    select.disabled = true;
}

/**
 * Notificación Toast estilo Tailwind (Compatible con tu CSS de Usuarios)
 */
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