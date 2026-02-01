document.addEventListener('DOMContentLoaded', () => {
    const formActa = document.getElementById('form-acta-especial');

    // Inicialización de la página
    cargarDocentes();
    cargarEstudiantes();
    listarSolicitudesProcesadas();

    // --- CREAR NUEVA ACTA ---
    if (formActa) {
        formActa.addEventListener('submit', async (e) => {
            e.preventDefault();

            const payload = {
                titulo: document.getElementById("titulo").value,
                descripcion: document.getElementById("descripcion").value,
                tipo: document.getElementById("tipo").value,
                docente_id: document.getElementById("docente_id").value,
                estudiante_id: document.getElementById("estudiante_id").value || null
            };

            if (!payload.titulo || !payload.docente_id) {
                return mostrarNotificacion("Título y Docente son obligatorios", "error");
            }

            try {
                const res = await fetch("/api/actas-especiales/crear-acta-especial", {
                    method: 'POST',
                    body: JSON.stringify(payload),
                    headers: { 'Content-Type': 'application/json' }
                });

                const result = await res.json();

                if (result.status === "ok") {
                    mostrarNotificacion("¡Acta creada con éxito!");
                    formActa.reset();
                    // Refrescamos la tabla dinámicamente
                    listarSolicitudesProcesadas(); 
                } else {
                    mostrarNotificacion("Error: " + result.message, "error");
                }
            } catch (err) {
                console.error("Error en el fetch:", err);
                mostrarNotificacion("Error de conexión al servidor", "error");
            }
        });
    }
});

// --- FUNCIONES DE CARGA DE DATOS ---

async function cargarDocentes() {
    const selectDocente = document.getElementById('docente_id');
    if (!selectDocente) return;

    try {
        const res = await fetch('/api/actas-especiales/obtener-docentes');
        const result = await res.json();

        if (result.status === "ok") {
            selectDocente.innerHTML = '<option value="">Seleccione un docente</option>';
            result.data.forEach(doc => {
                selectDocente.innerHTML += `<option value="${doc.id}">${doc.nombre}</option>`;
            });
        }
    } catch (err) {
        console.error("Error cargando docentes:", err);
    }
}

async function cargarEstudiantes() {
    const selectEstudiante = document.getElementById('estudiante_id');
    if (!selectEstudiante) return;

    try {
        const res = await fetch('/api/actas-especiales/obtener-estudiantes');
        const result = await res.json();

        if (result.status === "ok") {
            selectEstudiante.innerHTML = '<option value="">Seleccione un estudiante (opcional)</option>';
            result.data.forEach(est => {
                selectEstudiante.innerHTML += `<option value="${est.id}">${est.nombre}</option>`;
            });
        }
    } catch (err) {
        console.error("Error cargando estudiantes:", err);
    }
}

async function listarSolicitudesProcesadas() {
    const tbody = document.getElementById("cuerpo-tabla-procesadas");
    if (!tbody) return;

    try {
        const res = await fetch("/api/actas-especiales/listar-actas");
        if (!res.ok) throw new Error("Error al obtener datos");

        const result = await res.json();

        if (result.status === "ok" && result.data.length > 0) {
            tbody.innerHTML = result.data.map(acta => `
                <tr class="border-b hover:bg-gray-50 transition">
                    <td class="px-4 py-2 text-center font-mono text-xs">${acta.id}</td>
                    <td class="px-4 py-2 text-center font-medium">${acta.titulo}</td>
                    <td class="px-4 py-2 text-center">${acta.docente || 'N/A'}</td>
                    <td class="px-4 py-2 text-center text-sm">${acta.tipo}</td>
                    <td class="px-4 py-2 text-center">
                        <span class="px-2 py-1 rounded-full text-xs ${
                            acta.estado === 'Pendiente' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                        }">
                            ${acta.estado}
                        </span>
                    </td>
                    <td class="px-4 py-2 text-center">
                        <button onclick="eliminarActa('${acta.id}')" 
                                class="bg-red-500 hover:bg-red-700 text-white px-3 py-1 rounded text-xs transition">
                            Eliminar
                        </button>
                    </td>
                </tr>
            `).join("");
        } else {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center py-6 text-gray-500 italic">No hay registros encontrados.</td></tr>`;
        }
    } catch (e) {
        console.error("Error al listar actas:", e.message);
        tbody.innerHTML = `<tr><td colspan="6" class="text-center py-6 text-red-500">Error al cargar datos.</td></tr>`;
    }
}

// --- ACCIONES DE GESTIÓN ---

async function eliminarActa(id) {
    if (!confirm('¿Deseas eliminar permanentemente esta acta?')) return;

    try {
        const res = await fetch(`/api/actas-especiales/eliminar-actas-especiales`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });

        if (res.ok) {
            mostrarNotificacion("Acta eliminada correctamente");
            listarSolicitudesProcesadas(); // Actualización inmediata sin recargar
        } else {
            mostrarNotificacion("No se pudo eliminar el acta", "error");
        }
    } catch (err) {
        mostrarNotificacion("Error de red", "error");
    }
}

// --- UTILIDAD: NOTIFICACIONES ---
function mostrarNotificacion(mensaje, tipo = 'exito') {
    const color = tipo === 'exito' ? 'bg-green-600' : 'bg-red-600';
    const toast = document.createElement('div');
    toast.className = `fixed bottom-5 right-5 ${color} text-white px-6 py-3 rounded-lg shadow-2xl z-50 transition-opacity duration-500`;
    toast.innerHTML = `<span class="font-bold">${mensaje}</span>`;
    
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}