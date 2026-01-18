document.addEventListener('DOMContentLoaded', () => {
    const semestreSelect = document.getElementById('semestre');
    const materiaSelect = document.getElementById('materia_id');
    const seccionInput = document.getElementById('seccion_nombre');
    const formRegistro = document.getElementById('formRegistroSeccion');

    // 1. Lógica de filtros en cascada (Local)
    semestreSelect?.addEventListener('change', () => {
        const semestre = semestreSelect.value;
        
        // Resetear siguientes niveles
        materiaSelect.value = '';
        seccionInput.value = '';
        seccionInput.disabled = true;

        if (semestre) {
            Array.from(materiaSelect.options).forEach(opt => {
                if (!opt.value) return; 
                const coincide = opt.getAttribute('data-semestre') === semestre;
                opt.hidden = !coincide;
                opt.disabled = !coincide;
            });
            materiaSelect.disabled = false;
        } else {
            materiaSelect.disabled = true;
        }
    });

    materiaSelect?.addEventListener('change', () => {
        seccionInput.disabled = !materiaSelect.value;
        if (!materiaSelect.value) seccionInput.value = '';
    });

    // 2. Registrar Sección
    formRegistro?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(formRegistro);
        const payload = Object.fromEntries(formData.entries());

        try {
            const res = await fetch('/api/materias/crear-seccion', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            manejarRespuesta(data);
        } catch (error) {
            alert('Error de conexión');
        }
    });
});

// --- Funciones Globales para la Tabla ---

async function editarSeccion(event, id) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const payload = Object.fromEntries(formData.entries());

    try {
        const res = await fetch(`/api/secciones/editar/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        manejarRespuesta(data);
    } catch (error) {
        alert('Error al editar');
    }
}

async function eliminarSeccion(id) {
    if (!confirm('¿Está seguro de eliminar esta sección?')) return;

    try {
        const res = await fetch(`/api/secciones/eliminar/${id}`, {
            method: 'DELETE'
        });
        const data = await res.json();
        manejarRespuesta(data);
    } catch (error) {
        alert('Error al eliminar');
    }
}

function manejarRespuesta(data) {
    if (data.status === "ok") {
        alert(data.message);
        if (data.redirect) window.location.href = data.redirect;
        else window.location.reload();
    } else {
        alert("Error: " + data.message);
    }
}

function toggleModal(id, show) {
    const modal = document.getElementById(`modal-${id}`);
    if (modal) {
        modal.classList.toggle('hidden', !show);
    }
}