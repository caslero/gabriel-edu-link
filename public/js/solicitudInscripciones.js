document.addEventListener('DOMContentLoaded', () => {
    // --- 1. REFERENCIAS ---
    const selectSemestre = document.getElementById('semestre'); // ID del select en vista estudiante
    const selectMateria = document.getElementById('materia_id');
    const selectSeccion = document.getElementById('seccion_id');
    const formInscripcion = document.querySelector('form.space-y-4');
    const inputEstudiante = document.getElementById('estudiante_id');

    // --- 2. CARGA INICIAL DE SEMESTRES (Tal cual tus rutas funcionales) ---
    const cargarSemestres = async () => {
        if (!selectSemestre) return;
        try {
            const res = await fetch('/api/inscripcion/semestres');
            const data = await res.json();
            
            if (data.status === "ok" && data.semestres) {
                selectSemestre.innerHTML = '<option value="">Selecciona el Semestre</option>';
                data.semestres.forEach(item => {
                    const option = document.createElement('option');
                    option.value = item.semestre; 
                    option.textContent = `Semestre ${item.semestre}`;
                    selectSemestre.appendChild(option);
                });
            }
        } catch (err) {
            console.error("Error cargando semestres:", err);
        }
    };

    // --- 3. FILTRADO: Semestre -> Materia (Tal cual tus rutas funcionales) ---
    if (selectSemestre) {
        selectSemestre.addEventListener('change', async (e) => {
            const semestreId = e.target.value;
            
            // Reset de hijos
            resetSelect(selectMateria, "Selecciona la Materia");
            resetSelect(selectSeccion, "Selecciona la Sección");

            if (!semestreId) return;

            try {
                const res = await fetch(`/api/inscripcion/materias?semestre=${semestreId}`);
                const data = await res.json();

                if (data.status === "ok" && Array.isArray(data.materias)) {
                    selectMateria.innerHTML = '<option value="">Selecciona la Materia</option>';
                    data.materias.forEach(materia => {
                        const option = document.createElement('option');
                        option.value = materia.nombre; // Usamos el nombre como valor según tu lógica
                        option.textContent = materia.nombre;
                        selectMateria.appendChild(option);
                    });
                    selectMateria.disabled = false;
                }
            } catch (err) {
                console.error("Error cargando materias:", err);
            }
        });
    }

    // --- 4. FILTRADO: Materia -> Sección (Tal cual tus rutas funcionales) ---
    if (selectMateria) {
        selectMateria.addEventListener('change', async (e) => {
            const nombreMateria = e.target.value;
            
            resetSelect(selectSeccion, "Selecciona la Sección");

            if (!nombreMateria) return;

            try {
                const res = await fetch(`/api/inscripcion/secciones?nombreMateria=${encodeURIComponent(nombreMateria)}`);
                const data = await res.json();

                if (data.status === "ok" && Array.isArray(data.secciones)) {
                    selectSeccion.innerHTML = '<option value="">Selecciona la Sección</option>';
                    data.secciones.forEach(sec => {
                        const option = document.createElement('option');
                        option.value = sec.id; // El ID de la sección para el envío
                        option.textContent = `${sec.seccion_nombre} (Cupos: ${sec.cupos})`;
                        selectSeccion.appendChild(option);
                    });
                    selectSeccion.disabled = false;
                }
            } catch (err) {
                console.error("Error cargando secciones:", err);
            }
        });
    }

    // --- 5. ENVÍO DE SOLICITUD ---
 if (formInscripcion) {
    formInscripcion.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Buscamos los elementos
        const inputUsuario = formInscripcion.querySelector('[name="usuario_id"]');
        const selectSeccion = formInscripcion.querySelector('[name="seccion_id"]');

        // Log de diagnóstico: ¿Qué está leyendo realmente?
        console.log("Diagnóstico de campos:", {
            valorUsuarioRaw: inputUsuario ? inputUsuario.value : "NO EXISTE EL INPUT",
            valorSeccionRaw: selectSeccion ? selectSeccion.value : "NO EXISTE EL SELECT"
        });

        if (!inputUsuario || !selectSeccion) {
            return mostrarNotificacion("Error técnico: Campos no encontrados", "error");
        }

        // Creamos el payload
        const payload = {
            usuario_id: parseInt(inputUsuario.value),
            seccion_id: parseInt(selectSeccion.value),
            estado: 'Pendiente'
        };

        // Si el usuario_id sigue siendo NaN, detenemos todo antes del Fetch
        if (isNaN(payload.usuario_id)) {
            console.error(" Fallo crítico: usuario_id es NaN. El servidor envió un valor vacío al HTML.");
            return mostrarNotificacion("Error: ID de usuario no válido. Revisa tu sesión.", "error");
        }
        
        if (isNaN(payload.seccion_id)) {
            return mostrarNotificacion("Por favor, selecciona una sección.", "error");
        }

        try {
            const btnSubmit = formInscripcion.querySelector('button[type="submit"]');
            if(btnSubmit) { btnSubmit.disabled = true; btnSubmit.innerText = "Enviando..."; }

            const res = await fetch('/api/inscripciones/solicitar-inscripcion', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            
            if (data.status === "ok") {
                mostrarNotificacion(" ¡Solicitud registrada!");
                setTimeout(() => location.reload(), 1500);
            } else {
                if(btnSubmit) { btnSubmit.disabled = false; btnSubmit.innerText = "Enviar solicitud"; }
                mostrarNotificacion(data.message || "Error al procesar", "error");
            }
        } catch (err) {
            console.error("Error Fetch:", err);
            mostrarNotificacion("Error de conexión", "error");
        }
    });
}
    // Inicializar
    cargarSemestres();
});

// --- FUNCIONES DE APOYO (Mantenidas de tu código original) ---

function resetSelect(select, texto) {
    if (!select) return;
    select.innerHTML = `<option value="">${texto}</option>`;
    select.value = "";
    select.disabled = true;
}

function mostrarNotificacion(mensaje, tipo = 'exito') {
    const color = tipo === 'exito' ? 'bg-green-600' : 'bg-red-600';
    const previa = document.getElementById('toast-estudiante');
    if (previa) previa.remove();

    const toast = document.createElement('div');
    toast.id = 'toast-estudiante';
    toast.className = `fixed bottom-5 right-5 ${color} text-white px-6 py-3 rounded-lg shadow-2xl z-[100] transition-opacity duration-500`;
    toast.innerHTML = `<span class="font-medium">${mensaje}</span>`;
    
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

window.toggleModal = function(id, show) {
    const m = document.getElementById(id);
    if(m) show ? m.classList.remove('hidden') : m.classList.add('hidden');
}