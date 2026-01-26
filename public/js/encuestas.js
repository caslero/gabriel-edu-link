document.addEventListener('DOMContentLoaded', () => {
    const formCrear = document.getElementById('form-crear-encuesta');
    const semestreSelect = document.getElementById('semestre');

    // --- 1. FILTRADO DINÁMICO (CREACIÓN) ---
    // (Lógica local para mostrar/ocultar materias según el semestre seleccionado)
    if (semestreSelect) {
        semestreSelect.addEventListener('change', (e) => {
            const semestre = e.target.value;
            const contenedor = document.getElementById('materias-container');
            const items = document.querySelectorAll('.materia-item');

            if (semestre) {
                contenedor.classList.remove('hidden');
                items.forEach(item => {
                    const match = item.getAttribute('data-semestre') === semestre;
                    item.classList.toggle('hidden', !match);
                    if (!match) item.querySelector('input').checked = false;
                });
            } else {
                contenedor.classList.add('hidden');
            }
        });
    }

    // --- 2. PETICIÓN FETCH: CREAR ENCUESTA ---
    if (formCrear) {
        formCrear.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(formCrear);
            
            const dataObj = Object.fromEntries(formData.entries());
            dataObj.materias = formData.getAll('materias[]');

            try {
                // ENVÍA (POST): JSON con { titulo, descripcion, semestre, fecha_inicio, fecha_fin, materias: [id1, id2...] }
                // RECIBE: Objeto con status: 'ok' y mensaje de éxito o error.
                const res = await fetch('/api/encuestas/crear-encuesta', { 
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(dataObj)
                });
                const result = await res.json();

                if (result.status === 'ok') {
                    mostrarToast("Encuesta creada correctamente");
                    setTimeout(() => location.reload(), 1500);
                } else {
                    mostrarToast(result.message || "Error al crear", "error");
                }
            } catch (err) {
                mostrarToast("Error de conexión", "error");
            }
        });
    }
});

// --- 3. PETICIÓN FETCH: ACTUALIZAR ---
async function actualizarEncuesta(e, id) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const dataObj = Object.fromEntries(formData.entries());
    dataObj.materias = formData.getAll('materias[]');

    try {
        // ENVÍA (PATCH): JSON con { id (oculto en el form), titulo, descripcion, semestre, fecha_inicio, fecha_fin, estado, materias: [id1, id2...] }
        // RECIBE: Confirmación de actualización exitosa.
        const res = await fetch('/api/encuestas/actualizar-encuestas', { 
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dataObj)
        });
        const result = await res.json();

        if (result.status === 'ok') {
            mostrarToast("Cambios guardados");
            setTimeout(() => location.reload(), 1000);
        } else {
            mostrarToast(result.message, "error");
        }
    } catch (err) {
        mostrarToast("Error al actualizar", "error");
    }
}

// --- 4. PETICIÓN FETCH: ELIMINAR ---
async function eliminarEncuesta(id) {
    if (!confirm("¿Seguro que deseas eliminar esta encuesta y sus votos asociados?")) return;

    try {
        // ENVÍA (PATCH): JSON con { id } para realizar el borrado (normalmente lógico o con eliminación en cascada de votos).
        // RECIBE: res.ok (true) si el servidor procesó la eliminación correctamente.
        const res = await fetch('/api/encuestas/eliminar-encuesta', { 
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });

        if (res.ok) {
            mostrarToast("Encuesta eliminada");
            setTimeout(() => location.reload(), 1000);
        }
    } catch (err) {
        mostrarToast("Error al eliminar", "error");
    }
}

function mostrarToast(mensaje, tipo = 'exito') {
    const toast = document.createElement('div');
    const color = tipo === 'exito' ? 'bg-green-600' : 'bg-red-600';
    toast.className = `fixed bottom-5 right-5 ${color} text-white px-6 py-3 rounded shadow-lg z-[100] transition-opacity duration-500`;
    toast.innerText = mensaje;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}