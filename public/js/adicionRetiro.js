document.addEventListener("DOMContentLoaded", () => {
    // --- 1. REFERENCIAS DE ELEMENTOS ---
    const formNueva = document.getElementById("form-nueva-solicitud");
    const buscarCedulaInput = document.getElementById('buscarCedula');
    const btnBuscarCedula = document.getElementById('btnBuscarCedula');
    
    const estudianteSelect = document.getElementById("estudiante_id");
    const semestreSelect   = document.getElementById("semestre_id");
    const materiaSelect    = document.getElementById("materia_id");
    const seccionSelect    = document.getElementById("seccion_id");
    const tipoSelect       = document.getElementById("tipo");

    // --- 2. LÓGICA DE BÚSQUEDA DE ESTUDIANTE POR CÉDULA ---
    if (btnBuscarCedula && buscarCedulaInput) {
        const realizarBusqueda = async () => {
            const prefijo = document.getElementById('prefijoCedula').value;
            const cedula = buscarCedulaInput.value.trim();
            
            if (!cedula) return mostrarNotificacion("Ingrese una cédula", "error");

            try {
                // El prefijo '1' suele ser V y '0' es E
                const letra = prefijo === "1" ? "V" : "E";
                // Ajusta esta URL a tu endpoint real de búsqueda
                const res = await fetch(`/api/inscripciones/buscar-estudiante?cedula=${cedula}&tipo=${letra}`);
                const data = await res.json();

                if (data.status === "ok") {
                    // Llenamos el select con el único estudiante encontrado
                    estudianteSelect.innerHTML = `<option value="${data.estudiante.id}" selected>${data.estudiante.nombre} (${letra}-${cedula})</option>`;
                    
                    // Habilitamos los campos siguientes
                    estudianteSelect.disabled = false;
                    semestreSelect.disabled = false;
                    tipoSelect.disabled = false;
                    
                    mostrarNotificacion("Estudiante encontrado");
                } else {
                    mostrarNotificacion(data.message || "Estudiante no encontrado", "error");
                    resetCascada();
                }
            } catch (err) {
                mostrarNotificacion("Error al conectar con el servidor", "error");
            }
        };

        btnBuscarCedula.addEventListener('click', realizarBusqueda);
        buscarCedulaInput.addEventListener('keydown', (e) => { 
            if (e.key === 'Enter') { e.preventDefault(); realizarBusqueda(); } 
        });
    }

    // --- 3. LÓGICA DE FILTRADO EN CASCADA ---
    semestreSelect.addEventListener("change", () => {
        const semestre = semestreSelect.value;
        // Limpiamos hijos
        materiaSelect.value = "";
        seccionSelect.value = "";
        
        if (semestre) {
            materiaSelect.disabled = false;
            filtrarOpcionesLocales(materiaSelect, 'data-semestre', semestre);
        } else {
            materiaSelect.disabled = true;
            seccionSelect.disabled = true;
        }
    });

    materiaSelect.addEventListener("change", () => {
        const materiaId = materiaSelect.value;
        seccionSelect.value = "";
        
        if (materiaId) {
            seccionSelect.disabled = false;
            filtrarOpcionesLocales(seccionSelect, 'data-materia', materiaId);
        } else {
            seccionSelect.disabled = true;
        }
    });

    function resetCascada() {
        estudianteSelect.innerHTML = '<option value="">Realice una búsqueda...</option>';
        estudianteSelect.disabled = true;
        semestreSelect.value = "";
        semestreSelect.disabled = true;
        materiaSelect.value = "";
        materiaSelect.disabled = true;
        seccionSelect.value = "";
        seccionSelect.disabled = true;
        tipoSelect.disabled = true;
    }

    // --- 4. ENVÍO DE FORMULARIO ---
    if (formNueva) {
        formNueva.addEventListener("submit", async (e) => {
            e.preventDefault();
            // Aseguramos que el ID del estudiante se envíe aunque el select esté "disabled"
            // (Los campos disabled no se envían en el FormData por defecto)
            const formData = new FormData(formNueva);
            const payload = Object.fromEntries(formData);
            
            // Si el select está disabled pero tiene valor, lo agregamos manualmente
            if (!payload.estudiante_id) payload.estudiante_id = estudianteSelect.value;

            try {
                const res = await fetch("/api/adicion-retiro/crear-adicion-retiro", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });
                const data = await res.json();
                
                if (data.status === "ok") {
                    mostrarNotificacion("Solicitud registrada con éxito");
                    setTimeout(() => location.reload(), 1500);
                } else {
                    mostrarNotificacion(data.message, "error");
                }
            } catch (err) {
                mostrarNotificacion("Error de conexión", "error");
            }
        });
    }
});

/**
 * Filtra opciones de un select basándose en un atributo data-*
 */
function filtrarOpcionesLocales(select, dataAttr, valor) {
    if (!select) return;
    Array.from(select.options).forEach(opt => {
        if (!opt.value) return; 
        const coincide = opt.getAttribute(dataAttr) === valor;
        opt.hidden = !coincide;
        // Importante para navegadores que no soportan hidden en options:
        opt.disabled = !coincide; 
    });
}

// --- GESTIÓN DE PENDIENTES (APROBAR/RECHAZAR) ---
async function gestionarSolicitud(id, nuevoEstado) {
    // Una confirmación rápida nativa antes de procesar
    if (!confirm(`¿Estás seguro de marcar esta solicitud como ${nuevoEstado}?`)) return;

    try {
        const res = await fetch("/api/adicion-retiro/actualizar-estado", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, estado: nuevoEstado })
        });
        const data = await res.json();

        if (data.status === "ok") {
            mostrarNotificacion(`Solicitud ${nuevoEstado} correctamente`);
            setTimeout(() => location.reload(), 1000);
        } else {
            mostrarNotificacion(data.message, "error");
        }
    } catch (err) {
        mostrarNotificacion("Error al procesar la solicitud", "error");
    }
}

// --- GESTIÓN DE ELIMINACIÓN---
let idAEliminar = null;

function confirmarEliminarSolicitud(id) {
    idAEliminar = id;
    const modal = document.getElementById('modal-eliminar');
    if (modal) modal.classList.remove('hidden');
}

function cerrarModalEliminar() {
    idAEliminar = null;
    const modal = document.getElementById('modal-eliminar');
    if (modal) modal.classList.add('hidden');
}

async function ejecutarEliminacion() {
    if (!idAEliminar) return;

    try {
        const res = await fetch("/api/adicion-retiro/eliminar", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: idAEliminar })
        });
        const data = await res.json();

        if (data.status === "ok") {
            mostrarNotificacion("Registro eliminado del historial");
            cerrarModalEliminar();
            setTimeout(() => location.reload(), 1000);
        } else {
            mostrarNotificacion(data.message, "error");
        }
    } catch (err) {
        mostrarNotificacion("Error al eliminar el registro", "error");
    }
}

/**
 * Notificación Toast
 */
function mostrarNotificacion(mensaje, tipo = 'exito') {
    const color = tipo === 'exito' ? 'bg-green-600' : 'bg-red-600';
    const toast = document.createElement('div');
    toast.className = `fixed bottom-5 right-5 ${color} text-white px-6 py-3 rounded-lg shadow-2xl z-50 transition-all duration-500 transform translate-y-0`;
    toast.innerHTML = mensaje;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-10');
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}