document.addEventListener("DOMContentLoaded", () => {
    const formNueva = document.getElementById("form-nueva-solicitud");
    const estudianteSelect = document.getElementById("estudiante_id");
    const semestreSelect   = document.getElementById("semestre_id");
    const materiaSelect    = document.getElementById("materia_id");
    const seccionSelect    = document.getElementById("seccion_id");
    const tipoSelect       = document.getElementById("tipo");

    // --- 1. LÓGICA DE FILTRADO (CASCADA) ---
    estudianteSelect.addEventListener("change", () => {
        const hasValue = !!estudianteSelect.value;
        semestreSelect.disabled = !hasValue;
        tipoSelect.disabled = !hasValue;
        if(!hasValue) resetCascada();
    });

    semestreSelect.addEventListener("change", () => {
        const semestre = semestreSelect.value;
        materiaSelect.value = "";
        seccionSelect.value = "";
        materiaSelect.disabled = !semestre;
        
        if (semestre) {
            Array.from(materiaSelect.options).forEach(opt => {
                if (!opt.value) return;
                opt.hidden = opt.getAttribute("data-semestre") !== semestre;
            });
        }
    });

    materiaSelect.addEventListener("change", () => {
        const materiaId = materiaSelect.value;
        seccionSelect.value = "";
        seccionSelect.disabled = !materiaId;

        if (materiaId) {
            Array.from(seccionSelect.options).forEach(opt => {
                if (!opt.value) return;
                opt.hidden = opt.getAttribute("data-materia") !== materiaId;
            });
        }
    });

    function resetCascada() {
        semestreSelect.value = "";
        materiaSelect.value = "";
        seccionSelect.value = "";
        materiaSelect.disabled = true;
        seccionSelect.disabled = true;
    }

    // --- 2. REGISTRO DE NUEVA SOLICITUD ---
    formNueva.addEventListener("submit", async (e) => {
        e.preventDefault();
        const payload = Object.fromEntries(new FormData(formNueva));

        try {
            const res = await fetch("/api/adicion-retiro/crear-adicion-retiro", { // estudiante_id, semestre_id, materia_id, seccion_id, tipo
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
});

// --- 3. GESTIÓN DE PENDIENTES (APROBAR/RECHAZAR) ---
async function gestionarSolicitud(id, nuevoEstado) {
    try {
        const res = await fetch("/api/adicion-retiro/actualizar-estado", {// id, estado ('Aprobada', 'Rechazada', 'Procesada').
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, estado: nuevoEstado })
        });
        const data = await res.json();

        if (data.status === "ok") {
            mostrarNotificacion(`Solicitud ${nuevoEstado}`);
            setTimeout(() => location.reload(), 1000);
        }
    } catch (err) {
        mostrarNotificacion("Error al procesar", "error");
    }
}

// --- 4. ELIMINAR (MODAL ESTILO TAILWIND) ---
function confirmarEliminarSolicitud(id) {
    // Aquí puedes usar el mismo modal de "confirmarEliminacion" que preparamos antes
    // Por brevedad, ejecutamos el fetch directo tras confirmación visual:
    if(confirm("¿Estás seguro de eliminar este registro histórico?")) {
        ejecutarEliminacion(id);
    }
}

async function ejecutarEliminacion(id) {
    try {
        const res = await fetch("/api/adicion-retiro/eliminar", { // id
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id })
        });
        if (res.ok) {
            mostrarNotificacion("Registro eliminado");
            setTimeout(() => location.reload(), 1000);
        }
    } catch (err) {
        mostrarNotificacion("Error al eliminar", "error");
    }
}

// --- 5. UTILIDADES (NOTIFICACIONES) ---
function mostrarNotificacion(mensaje, tipo = 'exito') {
    const color = tipo === 'exito' ? 'bg-green-600' : 'bg-red-600';
    const toast = document.createElement('div');
    toast.className = `fixed bottom-5 right-5 ${color} text-white px-6 py-3 rounded-lg shadow-2xl z-50 transition-all`;
    toast.innerHTML = mensaje;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}