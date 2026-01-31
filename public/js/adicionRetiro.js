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

    // --- 2. CARGA INICIAL ---
    listarSolicitudesProcesadas();

    // --- 3. LÓGICA DE BÚSQUEDA DE ESTUDIANTE ---
    const realizarBusqueda = async () => {
        const cedula = buscarCedulaInput.value.trim();
        const letra = prefijoCedula?.value === "1" ? "V" : "E";
        
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
                
                await cargarSemestres();
                if (tipoSelect) tipoSelect.disabled = false;
                mostrarNotificacion("Estudiante encontrado: " + data.estudiante.nombre);
            } else {
                mostrarNotificacion(data.message || "Estudiante no registrado", "error");
                resetCascada();
            }
        } catch (err) {
            mostrarNotificacion("Error al conectar con el servidor", "error");
        }
    };

    if (btnBuscarCedula) btnBuscarCedula.onclick = (e) => { e.preventDefault(); realizarBusqueda(); };

    // --- 4. CARGA DE SEMESTRES ---
    async function cargarSemestres() {
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
            console.error(err);
        }
    }

    // --- 5. FILTRADO DINÁMICO ---
    if (semestreSelect) {
        semestreSelect.addEventListener('change', async (e) => {
            const semestre = e.target.value;
            if (!semestre) return;
            try {
                const res = await fetch(`/api/adicion-retiro/materias?semestre=${semestre}`);
                const data = await res.json();
                if (data.status === "ok") {
                    materiaSelect.innerHTML = '<option value="">Selecciona la Materia</option>';
                    data.materias.forEach(mat => {
                        materiaSelect.innerHTML += `<option value="${mat.nombre}">${mat.nombre}</option>`;
                    });
                    materiaSelect.disabled = false;
                }
            } catch (err) { console.error(err); }
        });
    }

    if (materiaSelect) {
        materiaSelect.addEventListener('change', async (e) => {
            const nombreMateria = e.target.value;
            if (!nombreMateria) return;
            try {
                const res = await fetch(`/api/adicion-retiro/secciones?nombreMateria=${encodeURIComponent(nombreMateria)}`);
                const data = await res.json();
                if (data.status === "ok") {
                    seccionSelect.innerHTML = '<option value="">Selecciona la Sección</option>';
                    data.secciones.forEach(sec => {
                        seccionSelect.innerHTML += `<option value="${sec.id}">${sec.seccion_nombre} (Cupos: ${sec.cupos})</option>`;
                    });
                    seccionSelect.disabled = false;
                }
            } catch (err) { console.error(err); }
        });
    }

    // --- 6. ENVÍO DEL FORMULARIO ---
    if (formNueva) {
        formNueva.addEventListener("submit", async (e) => {
            e.preventDefault();

           // Dentro de formNueva.addEventListener("submit"...)
            const payload = {
                estudiante_id: parseInt(document.getElementById("estudiante_id").value),
                seccion_id: parseInt(document.getElementById("seccion_id").value),
                tipo: document.getElementById("tipo").value
            };


            if (isNaN(payload.estudiante_id) || isNaN(payload.seccion_id) || !payload.tipo) {
                return mostrarNotificacion("Error: Datos del formulario incompletos", "error");
            }

            try {
                const res = await fetch("/api/adicion-retiro/crear-adicion-retiro", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });

                const data = await res.json();
                
                if (res.ok && data.status === "ok") {
                    mostrarNotificacion(data.message || "Registro guardado", "success"); 
                    formNueva.reset();
                    resetCascada();
                    await listarSolicitudesProcesadas(); 
                } else {
                    mostrarNotificacion(data.message || "Error al procesar", "error");
                }
            } catch (err) {
                mostrarNotificacion("Error de conexión", "error");
            }
        });
    }

    function resetCascada() {
        estudianteSelect.innerHTML = '<option value="">Realice una búsqueda...</option>';
        estudianteSelect.disabled = true;
        [semestreSelect, materiaSelect, seccionSelect].forEach(sel => {
            if(sel) { sel.innerHTML = '<option value="">--</option>'; sel.disabled = true; }
        });
    }
});

// --- FUNCIONES QUE DEBEN SER GLOBALES (Fuera del DOMContentLoaded) ---

async function listarSolicitudesProcesadas() {
    try {
        const res = await fetch("/api/adicion-retiro/listar-procesadas");
        const data = await res.json();
        const tbody = document.querySelector("#cuerpo-tabla-procesadas"); 
        if (!tbody || data.status !== "ok") return;

        if (!data.datos || data.datos.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" class="text-center py-6 text-gray-400 italic">No hay registros</td></tr>`;
            return;
        }

        tbody.innerHTML = data.datos.map(reg => `
            <tr class="text-sm border-b hover:bg-gray-50">
                <td class="px-4 py-3 text-center text-gray-500 font-mono">${reg.id}</td>
                <td class="px-4 py-3 text-center font-medium">${reg.estudiante_nombre}</td>
                <td class="px-4 py-3 text-center">
                    <span class="${reg.tipo === 'Adicion' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'} px-2 py-1 rounded text-xs font-bold">${reg.tipo}</span>
                </td>
                <td class="px-4 py-3 text-center">
                    <span class="${reg.estado === 'Aprobada' ? 'text-green-600' : 'text-red-600'} font-bold">${reg.estado}</span>
                </td>
            </tr>`).join("");
    } catch (e) { console.error(e); }
}


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