
document.addEventListener('DOMContentLoaded', () => {
    const semestreSelect = document.getElementById('semestre');
    const materiaSelect = document.getElementById('materia_id');
    const seccionInput = document.getElementById('seccion_nombre');
    const formRegistro = document.querySelector('form');

    // 1. Lógica de filtros en los selectores
    semestreSelect.addEventListener('change', () => {
        const semestre = semestreSelect.value;
        materiaSelect.value = '';
        seccionInput.value = '';
        seccionInput.disabled = true;

        if (semestre) {
            [...materiaSelect.options].forEach(opt => {
                if (!opt.value) return; 
                opt.hidden = opt.getAttribute('data-semestre') !== semestre;
            });
            materiaSelect.disabled = false;
        } else {
            materiaSelect.disabled = true;
        }
    });

    materiaSelect.addEventListener('change', () => {
        seccionInput.disabled = !materiaSelect.value;
    });

    // 2. Petición Fetch para registrar nueva sección
    formRegistro.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(formRegistro);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await fetch('/admin/secciones/registrar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                alert('Sección registrada con éxito');
                window.location.reload(); // Recarga para ver los cambios
            } else {
                alert('Error al registrar la sección');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error de conexión con el servidor');
        }
    });
});

// Función global para cerrar/abrir modales (usada en los botones del EJS)
function toggleModal(id, show) {
    const modal = document.getElementById(`modal-${id}`);
    if (show) {
        modal.classList.remove('hidden');
    } else {
        modal.classList.add('hidden');
    }
}