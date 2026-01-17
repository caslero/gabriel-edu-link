
document.addEventListener('DOMContentLoaded', () => {
    // --- Referencias de Selectores ---
    const selectSemestre = document.getElementById('semestre_id') || document.getElementById('semestre');
    const selectMateria = document.getElementById('materia_id');
    const selectSeccion = document.getElementById('seccion_id');
    const formInscripcion = document.querySelector('form');

    // --- Referencias Exclusivas Admin ---
    const buscarCedula = document.getElementById('buscarCedula');
    const btnBuscarCedula = document.getElementById('btnBuscarCedula');
    const selectEstudiante = document.getElementById('estudiante_id');

    const esModoAdmin = !!buscarCedula;

    // --- 1. LÓGICA DE BÚSQUEDA (SOLO ADMIN) ---
    if (esModoAdmin && btnBuscarCedula) {
        const realizarBusqueda = async () => {
            const prefijo = document.getElementById('prefijoCedula').value;
            const cedula = buscarCedula.value.trim();
            if (!cedula) return alert("Ingrese una cédula");

            try {
                // Ruta ajustada a tu controlador de búsqueda
                const res = await fetch(`/api/inscripciones/buscar-estudiante/${prefijo}${cedula}`);
                const data = await res.json();

                if (data.status === "ok") {
                    selectEstudiante.innerHTML = `<option value="${data.estudiante.id}">${data.estudiante.nombre} (${data.estudiante.cedula})</option>`;
                    selectEstudiante.disabled = false;
                    selectSemestre.disabled = false;
                } else {
                    alert(data.message);
                    resetSelect(selectEstudiante, "Realice una búsqueda...");
                }
            } catch (err) { 
                console.error("Error en búsqueda:", err);
                alert("Error al conectar con el servidor");
            }
        };

        btnBuscarCedula.addEventListener('click', realizarBusqueda);
        buscarCedula.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                realizarBusqueda();
            }
        });
    }

    // --- 2. FILTRADO (CASCADA LOCAL) ---

    if (selectSemestre) {
        selectSemestre.addEventListener('change', () => {
            const semestre = selectSemestre.value;
            resetSelect(selectMateria, "Selecciona la Materia");
            resetSelect(selectSeccion, "Selecciona la Sección");

            if (!semestre) return;

            filtrarOpcionesLocales(selectMateria, 'data-semestre', semestre);
            selectMateria.disabled = false;
        });
    }

    if (selectMateria) {
        selectMateria.addEventListener('change', () => {
            const materiaId = selectMateria.value;
            resetSelect(selectSeccion, "Selecciona la Sección");

            if (!materiaId) return;

            filtrarOpcionesLocales(selectSeccion, 'data-materia', materiaId);
            selectSeccion.disabled = false;
        });
    }

    // --- 3. ENVÍO (FETCH) ---
    if (formInscripcion) {
        formInscripcion.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = new FormData(formInscripcion);
            const payload = Object.fromEntries(formData.entries());

            try {
                // USAMOS LA RUTA UNIFICADA QUE DEFINISTE
                const res = await fetch('/api/inscripciones/crear-inscripcion', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                const data = await res.json();

                if (data.status === "ok") {
                    alert(data.message);
                    // Redirección dinámica según lo que responda el controlador
                    if (data.redirect) window.location.href = data.redirect;
                } else {
                    alert("Error: " + data.message);
                }
            } catch (err) {
                console.error("Error al enviar:", err);
                alert("Error de red al procesar la solicitud");
            }
        });
    }

    // --- FUNCIONES AUXILIARES ---

    function filtrarOpcionesLocales(select, dataAttr, valor) {
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

    window.toggleModal = (id, show) => {
        const modal = document.getElementById(id);
        if (modal) modal.classList.toggle('hidden', !show);
    };
});