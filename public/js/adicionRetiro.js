document.addEventListener("DOMContentLoaded", () => {
    // --- 1. REFERENCIAS DE ELEMENTOS ---
    const formNueva = document.getElementById("form-nueva-solicitud");
    const buscarCedulaInput = document.getElementById('buscarCedula');
    const btnBuscarCedula = document.getElementById('btnBuscarCedula');
    const prefijoCedula = document.getElementById('prefijoCedula');
    
    const estudianteSelect = document.getElementById("estudiante_id");
    const semestreSelect   = document.getElementById("semestre_id");
    const materiaSelect    = document.getElementById("materia_id");
    const seccionSelect    = document.getElementById("seccion_id");
    const tipoSelect       = document.getElementById("tipo");

    // --- 2. CARGA DE SEMESTRES ---
    const cargarSemestres = async () => {
        try {
            const res = await fetch('/api/adicion-retiro/semestres'); 
            const data = await res.json();
            
            if (data.status === "ok" && data.semestres) {
                semestreSelect.innerHTML = '<option value="">Selecciona el Semestre</option>';
                data.semestres.forEach(item => {
                    const option = document.createElement('option');
                    option.value = item.semestre; 
                    option.textContent = `Semestre ${item.semestre}`;
                    semestreSelect.appendChild(option);
                });
                semestreSelect.disabled = false;
            }
        } catch (err) {
            console.error("Error cargando semestres:", err);
            mostrarNotificacion("No se pudieron cargar los semestres", "error");
        }
    };

    // --- 3. LÓGICA DE BÚSQUEDA DE ESTUDIANTE ---
    const realizarBusqueda = async () => {
        const cedula = buscarCedulaInput.value.trim();
        const prefijo = prefijoCedula ? prefijoCedula.value : "1";
        const letra = prefijo === "1" ? "V" : "E";
        
        if (!cedula) return mostrarNotificacion("Ingrese una cédula", "error");

        try {
            const res = await fetch('/api/adicion-retiro/buscar-estudiante', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cedula, pais: letra })
            });
            const data = await res.json();

            if (data.status === "ok" && data.estudiante) {
                estudianteSelect.innerHTML = `<option value="${data.estudiante.id}" selected>${data.estudiante.nombre} (${letra}-${cedula})</option>`;
                estudianteSelect.disabled = false;
                
                // Cargamos semestres al encontrar estudiante
                await cargarSemestres();
                if (tipoSelect) tipoSelect.disabled = false;
                
                mostrarNotificacion("Estudiante encontrado: " + data.estudiante.nombre);
            } else {
                mostrarNotificacion(data.message || "Estudiante no registrado", "error");
                resetCascada();
            }
        } catch (err) {
            console.error("Error:", err);
            mostrarNotificacion("Error al conectar con el servidor", "error");
        }
    };

    if (btnBuscarCedula) btnBuscarCedula.onclick = (e) => { e.preventDefault(); realizarBusqueda(); };
    if (buscarCedulaInput) {
        buscarCedulaInput.onkeypress = (e) => { if (e.key === 'Enter') { e.preventDefault(); realizarBusqueda(); } };
    }

    // --- 4. FILTRADO DINÁMICO (MATERIAS Y SECCIONES) ---
    if (semestreSelect) {
        semestreSelect.addEventListener('change', async (e) => {
            const semestre = e.target.value;
            materiaSelect.innerHTML = '<option value="">Cargando materias...</option>';
            materiaSelect.disabled = true;
            seccionSelect.innerHTML = '<option value="">Selecciona la Sección</option>';
            seccionSelect.disabled = true;

            if (!semestre) return;

            try {
                const res = await fetch(`/api/adicion-retiro/materias?semestre=${semestre}`);
                const data = await res.json();

                if (data.status === "ok" && data.materias) {
                    materiaSelect.innerHTML = '<option value="">Selecciona la Materia</option>';
                    data.materias.forEach(mat => {
                        const option = document.createElement('option');
                        option.value = mat.nombre; 
                        option.textContent = mat.nombre;
                        materiaSelect.appendChild(option);
                    });
                    materiaSelect.disabled = false;
                }
            } catch (err) {
                mostrarNotificacion("Error al obtener materias", "error");
            }
        });
    }

    if (materiaSelect) {
        materiaSelect.addEventListener('change', async (e) => {
            const nombreMateria = e.target.value;
            seccionSelect.innerHTML = '<option value="">Cargando secciones...</option>';
            seccionSelect.disabled = true;

            if (!nombreMateria) return;

            try {
                const res = await fetch(`/api/adicion-retiro/secciones?nombreMateria=${encodeURIComponent(nombreMateria)}`);
                const data = await res.json();

                if (data.status === "ok" && data.secciones) {
                    seccionSelect.innerHTML = '<option value="">Selecciona la Sección</option>';
                    data.secciones.forEach(sec => {
                        const option = document.createElement('option');
                        option.value = sec.id; 
                        option.textContent = `${sec.seccion_nombre} (Cupos: ${sec.cupos})`;
                        seccionSelect.appendChild(option);
                    });
                    seccionSelect.disabled = false;
                }
            } catch (err) {
                mostrarNotificacion("Error al cargar secciones", "error");
            }
        });
    }

    // --- 5. ENVÍO DE FORMULARIO ---
  if (formNueva) {
    formNueva.addEventListener("submit", async (e) => {
        e.preventDefault();

        const payload = {
            estudiante_id: document.getElementById("estudiante_id").value,
            seccion_id: document.getElementById("seccion_id").value,
            tipo: document.getElementById("tipo").value
        };

        console.log("Datos a enviar:", payload); // Revisa esto en la consola del navegador

        if (!payload.estudiante_id || !payload.seccion_id) {
            return mostrarNotificacion("Debe completar todos los campos", "error");
        }

       try {
            const res = await fetch("/api/adicion-retiro/crear-adicion-retiro", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            
            if (res.ok && data.status === "ok") {
                // CASO ÉXITO
                mostrarNotificacion(data.message, "success"); 
                setTimeout(() => location.reload(), 1500);
            } else {
                // CASO ERROR (Aquí entrará el mensaje "Materia ya registrada...")
                // Usamos el mensaje que viene del servidor (data.message)
                mostrarNotificacion(data.message || "Error al procesar", "error");
            }
        } catch (err) {
            mostrarNotificacion("Error de conexión con el servidor", "error");
        }
    });
}

    function resetCascada() {
        estudianteSelect.innerHTML = '<option value="">Realice una búsqueda...</option>';
        estudianteSelect.disabled = true;
        if (semestreSelect) { semestreSelect.value = ""; semestreSelect.disabled = true; }
        if (materiaSelect) { materiaSelect.value = ""; materiaSelect.disabled = true; }
        if (seccionSelect) { seccionSelect.value = ""; seccionSelect.disabled = true; }
        if (tipoSelect) tipoSelect.disabled = true;
    }
});

// --- FUNCIONES GLOBALES (Para botones en la tabla EJS) ---

async function gestionarSolicitud(id, nuevoEstado) {
    if (!confirm(`¿Estás seguro de marcar esta solicitud como ${nuevoEstado}?`)) return;
    try {
        const res = await fetch("/api/adicion-retiro/actualizar-estado", {
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

let idAEliminar = null;
window.confirmarEliminarSolicitud = (id) => {
    idAEliminar = id;
    const modal = document.getElementById('modal-eliminar');
    if (modal) modal.classList.remove('hidden');
};

window.cerrarModalEliminar = () => {
    idAEliminar = null;
    const modal = document.getElementById('modal-eliminar');
    if (modal) modal.classList.add('hidden');
};

window.ejecutarEliminacion = async () => {
    if (!idAEliminar) return;
    try {
        const res = await fetch("/api/adicion-retiro/eliminar", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: idAEliminar })
        });
        const data = await res.json();
        if (data.status === "ok") {
            mostrarNotificacion("Registro eliminado");
            cerrarModalEliminar();
            setTimeout(() => location.reload(), 1000);
        }
    } catch (err) {
        mostrarNotificacion("Error al eliminar", "error");
    }
};

function mostrarNotificacion(mensaje, tipo = "success") {
    // 1. Intentar obtener el contenedor
    let contenedor = document.getElementById("contenedor-notificaciones");
    
    // 2. Si no existe, lo creamos dinámicamente para evitar el error de 'null'
    if (!contenedor) {
        contenedor = document.createElement("div");
        contenedor.id = "contenedor-notificaciones";
        contenedor.className = "fixed top-5 right-5 z-50 flex flex-col gap-2";
        document.body.appendChild(contenedor);
    }

    const div = document.createElement("div");
    
    // Clases de Tailwind según el tipo (Rojo para error, Verde para success)
    const bgColor = tipo === "success" ? "bg-green-600" : "bg-red-600";
    
    div.className = `${bgColor} text-white px-6 py-4 rounded-lg shadow-2xl min-w-[300px] flex justify-between items-center transform transition-all duration-300 translate-x-full`;
    
    div.innerHTML = `
        <span>${mensaje}</span>
        <button class="ml-4 font-bold" onclick="this.parentElement.remove()">×</button>
    `;

    contenedor.appendChild(div);

    // Animación de entrada (pequeño delay para que el navegador procese el render)
    setTimeout(() => {
        div.classList.remove("translate-x-full");
        div.classList.add("translate-x-0");
    }, 10);

    // Auto-eliminar después de 4 segundos
    setTimeout(() => {
        if (div.parentNode) {
            div.classList.add("opacity-0", "translate-y-[-20px]");
            setTimeout(() => div.remove(), 500);
        }
    }, 4000);
}