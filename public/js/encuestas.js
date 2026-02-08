document.addEventListener("DOMContentLoaded", () => {
    // Inicialización de datos
    cargarSemestres();
    listarEncuestas();

    const formCrear = document.getElementById("form-crear-encuesta");
    const formEditar = document.getElementById("form-editar-encuesta");
    const semestreSelect = document.getElementById("semestre");

    // --- 1. FILTRADO DINÁMICO (CREACIÓN) ---
    if (semestreSelect) {
        semestreSelect.addEventListener("change", async (e) => {
            const semestre = e.target.value;
            const contenedor = document.getElementById("materias-container");
            const listaMaterias = document.getElementById("materias-list");

            if (!semestre) {
                contenedor.classList.add("hidden");
                return;
            }

            const materias = await fetchMaterias(semestre);
            if (materias) {
                contenedor.classList.remove("hidden");
                listaMaterias.innerHTML = renderMateriasChecks(materias);
            }
        });
    }

    // --- 2. PETICIÓN: CREAR ENCUESTA (FETCH POST) ---
    if (formCrear) {
        formCrear.addEventListener("submit", async (e) => {
            e.preventDefault();
            const formData = new FormData(formCrear);
            const dataObj = Object.fromEntries(formData.entries());
            dataObj.materias = formData.getAll("materias[]");

            await enviarEncuesta("/api/encuestas/crear-encuesta", "POST", dataObj);
        });
    }

    // --- 3. PETICIÓN: ACTUALIZAR ENCUESTA (FETCH PUT) ---
if (formEditar) {
    formEditar.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        // Creamos el objeto FormData del formulario
        const formData = new FormData(formEditar);
        
        // Convertimos a objeto simple
        const dataObj = Object.fromEntries(formData.entries());
        
        // Campos que a veces fallan por ser readonly o por el formato:
        dataObj.id = document.getElementById("edit-id").value;
        dataObj.materias = formData.getAll("materias[]");

        // VALIDACIÓN PREVIA (Opcional pero recomendada)
        if (!dataObj.fecha_inicio || !dataObj.fecha_fin) {
            mostrarNotificacion("Las fechas son obligatorias", "error");
            return;
        }

        console.log("Enviando a actualizar:", dataObj);

        await enviarEncuesta("/api/encuestas/actualizar-encuesta", "PUT", dataObj);
    });
}
});

// --- FUNCIONES DE APOYO (FETCH API) ---

async function fetchMaterias(semestre) {
    try {
        const res = await fetch(`/api/encuestas/listar-materias?semestre=${semestre}`);
        const result = await res.json();
        return (result.status === "ok") ? result.data : null;
    } catch (err) {
        console.error("Error al obtener materias:", err);
        return null;
    }
}

function renderMateriasChecks(materias, seleccionadasIds = []) {
    if (materias.length === 0) return '<p class="text-gray-500 text-sm">No hay materias disponibles.</p>';
    
    return materias.map(mat => `
        <div class="flex items-center p-2 bg-gray-50 rounded mb-1 border border-gray-100">
            <input type="checkbox" id="mat-${mat.id}" name="materias[]" value="${mat.id}" 
                ${seleccionadasIds.includes(mat.id) ? 'checked' : ''}
                class="mr-2 h-4 w-4 text-blue-600">
            <label for="mat-${mat.id}" class="text-sm cursor-pointer">${mat.nombre}</label>
        </div>
    `).join("");
}

async function enviarEncuesta(url, metodo, data) {
    try {
        const res = await fetch(url, {
            method: metodo,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        const result = await res.json();
        
        if (result.status === "ok") {
            mostrarNotificacion(metodo === "POST" ? "Encuesta creada" : "Encuesta actualizada");
            setTimeout(() => location.reload(), 1000);
        } else {
            mostrarNotificacion(result.message || "Error en la operación", "error");
        }
    } catch (err) {
        mostrarNotificacion("Error de conexión", "error");
    }
}

// --- FUNCIONES GLOBALES ---

window.abrirModalEditar = async function (id) {
    const modal = document.getElementById("modal-editar-global");
    if (!modal) return;
    modal.classList.remove("hidden");

    try {
        const res = await fetch(`/api/encuestas/obtener/${id}`);
        const result = await res.json();

        if (result.status === "ok") {
            const e = result.data;
            
            document.getElementById("edit-id").value = e.id;
            document.getElementById("edit-titulo").value = e.titulo;
            
            // --- NUEVO: Cargar el estado actual en el select ---
            if(document.getElementById("edit-estado")) {
                document.getElementById("edit-estado").value = e.estado;
            }

            if(document.getElementById("edit-descripcion")) 
                document.getElementById("edit-descripcion").value = e.descripcion || "";
            if(document.getElementById("edit-semestre")) 
                document.getElementById("edit-semestre").value = e.semestre;
            if(document.getElementById("edit-fecha-inicio")) 
                document.getElementById("edit-fecha-inicio").value = e.fecha_inicio;
            if(document.getElementById("edit-fecha-fin")) 
                document.getElementById("edit-fecha-fin").value = e.fecha_fin;

            const todasLasMaterias = await fetchMaterias(e.semestre);
            const seleccionadasIds = e.materias_seleccionadas.map(m => m.id);
            document.getElementById("edit-materias-list").innerHTML = renderMateriasChecks(todasLasMaterias, seleccionadasIds);
        }
    } catch (err) {
        mostrarNotificacion("Error al cargar datos", "error");
    }
};

window.cerrarModal = function(id) {
    document.getElementById(id).classList.add("hidden");
};

async function cargarSemestres() {
    const selectSemestre = document.getElementById("semestre");
    if (!selectSemestre) return;

    try {
        const res = await fetch("/api/encuestas/obtener-semestres");
        const result = await res.json();

        if (result.status === "ok") {
            selectSemestre.innerHTML = '<option value="">Seleccione un semestre</option>';
            result.data.forEach((item) => {
                const option = document.createElement("option");
                option.value = item.semestre;
                option.textContent = `Semestre ${item.semestre}`;
                selectSemestre.appendChild(option);
            });
        }
    } catch (err) {
        console.error("Error cargando semestres:", err);
    }
}

async function listarEncuestas() {
    const tbody = document.querySelector("table tbody");
    if (!tbody) return;

    try {
        const res = await fetch("/api/encuestas/listar-encuestas");
        const result = await res.json();

        if (result.status === "ok") {
            const encuestas = result.data;
            if (encuestas.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" class="text-center py-6 text-gray-500">No hay encuestas registradas.</td></tr>';
                return;
            }

            tbody.innerHTML = encuestas.map(encuesta => {
                // 1. Configuración de colores por estado
                const estadoClass = 
                    encuesta.estado === "Activa" ? "bg-green-100 text-green-700" :
                    encuesta.estado === "Pendiente" ? "bg-yellow-100 text-yellow-700" :
                    encuesta.estado === "Finalizada" ? "bg-blue-100 text-blue-700" : // Color para finalizada
                    "bg-red-100 text-red-700";

                // 2. Lógica condicional para el botón principal (Editar vs Resultados)
                let botonPrincipal = '';
                if (encuesta.estado === "Finalizada") {
                    botonPrincipal = `
                        <button onclick="verResultados(${encuesta.id})" 
                                class="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition inline-flex items-center gap-1">
                            Resultados
                        </button>`;
                } else {
                    botonPrincipal = `
                        <button onclick="window.abrirModalEditar(${encuesta.id})" 
                                class="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 transition">
                            Editar
                        </button>`;
                }

                return `
                    <tr class="hover:bg-gray-50 transition border-b text-sm">
                        <td class="px-4 py-2 text-center">${encuesta.id}</td>
                        <td class="px-4 py-2 text-center font-medium text-blue-900">${encuesta.titulo}</td>
                        <td class="px-4 py-2 text-center">${encuesta.semestre}</td>
                        <td class="px-4 py-2 text-center">${encuesta.fecha_inicio}</td>
                        <td class="px-4 py-2 text-center">${encuesta.fecha_fin}</td>
                        <td class="px-4 py-2 text-center">
                            <span class="px-3 py-1 rounded-full text-xs font-bold ${estadoClass}">${encuesta.estado}</span>
                        </td>
                        <td class="px-4 py-2 text-center space-x-1">
                            ${botonPrincipal}
                            <button onclick="eliminarEncuesta('${encuesta.id}')" 
                                    class="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 transition">
                                Eliminar
                            </button>
                        </td>
                    </tr>`;
            }).join("");
        }
    } catch (err) {
        console.error("Error al listar encuestas:", err);
    }
}

window.verResultados = async function(id) {
    const modal = document.getElementById("modal-resultados");
    const ganadoresCont = document.getElementById("ganadores-container");
    const listaCont = document.getElementById("lista-detallada-resultados");
    
    modal.classList.remove("hidden");
    ganadoresCont.innerHTML = "<p class='text-center col-span-3'>Cargando resultados...</p>";
    listaCont.innerHTML = "";

    try {
        const res = await fetch(`/api/encuestas/resultados/${id}`);
        const result = await res.json();

        if (result.status === "ok") {
            const datos = result.data; // Esperamos un array de { nombre: string, votos: number } ordenado por votos desc
            
            document.getElementById("res-titulo").textContent = `Resultados: ${result.encuesta_titulo}`;

            // 1. Separar el Top 3
            const top3 = datos.slice(0, 3);
            const resto = datos.slice(3);

            // 2. Renderizar Ganadores (Tarjetas resaltadas)
            ganadoresCont.innerHTML = top3.map((m, index) => {
                const colores = ['bg-yellow-100 border-yellow-400', 'bg-gray-100 border-gray-400', 'bg-orange-100 border-orange-400'];
                const medallas = ['🥇', '🥈', '🥉'];
                
                return `
                    <div class="${colores[index] || 'bg-blue-50'} border-2 p-3 rounded-lg text-center shadow-sm">
                        <span class="text-2xl">${medallas[index] || '•'}</span>
                        <p class="font-bold text-gray-800 truncate">${m.nombre}</p>
                        <p class="text-blue-600 font-extrabold text-xl">${m.votos} votos</p>
                    </div>
                `;
            }).join("");

            // 3. Renderizar el resto en lista simple
            if(resto.length > 0) {
                listaCont.innerHTML = resto.map(m => `
                    <div class="flex justify-between items-center p-2 border-b border-gray-100">
                        <span class="text-gray-700">${m.nombre}</span>
                        <span class="font-bold text-gray-500">${m.votos} votos</span>
                    </div>
                `).join("");
            } else if (top3.length === 0) {
                ganadoresCont.innerHTML = "<p class='text-center col-span-3 text-gray-500'>Aún no hay votos registrados.</p>";
            }
        }
    } catch (err) {
        console.error("Error al obtener resultados:", err);
        ganadoresCont.innerHTML = "<p class='text-center col-span-3 text-red-500'>Error al cargar los datos.</p>";
    }
};

window.eliminarEncuesta = async function (id) {
    if (!confirm("¿Eliminar esta encuesta?")) return;
    try {
        const res = await fetch("/api/encuestas/eliminar-encuesta", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
        });
        const result = await res.json();
        if (result.status === "ok") {
            mostrarNotificacion("Encuesta eliminada");
            listarEncuestas();
        }
    } catch (err) {
        mostrarNotificacion("Error al eliminar", "error");
    }
};

function mostrarNotificacion(mensaje, tipo = "exito") {
    const color = tipo === "exito" ? "bg-green-600" : "bg-red-600";
    const toast = document.createElement("div");
    toast.className = `fixed bottom-5 right-5 ${color} text-white px-6 py-3 rounded-lg shadow-2xl z-50 transition-all duration-500`;
    toast.innerHTML = `<span class="font-bold">${mensaje}</span>`;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.classList.add("opacity-0");
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

/**--------------------ESTUDIANTES----------------------*/
document.addEventListener('DOMContentLoaded', () => {
    obtenerEncuestasEstudiante();
});

async function obtenerEncuestasEstudiante() {
    try {
        const response = await fetch('/api/encuesta/encuestas');
        const result = await response.json();

        const contenedor = document.getElementById('contenedor-encuestas');
        
        // PROTECCIÓN: Si el contenedor no existe en el HTML, no seguimos
        if (!contenedor) {
            console.error("Error: No se encontró el elemento 'contenedor-encuestas' en el HTML.");
            return;
        }

        contenedor.innerHTML = ''; 

        if (result.status === "ok") {
            // ... resto de tu lógica para pintar las encuestas
            console.log("Datos recibidos:", result.data);
        }
    } catch (error) {
        console.error("Error de conexión:", error);
    }
}


function crearCardEncuesta(encuesta) {
    // Generamos el HTML de las materias
    const listaMaterias = encuesta.materias.map(m => `<li>• ${m.nombre}</li>`).join('');
    
    // Verificamos si ya votó para deshabilitar el botón
    const boton = encuesta.votado 
        ? `<button disabled class="w-full bg-gray-300 text-gray-600 py-2 rounded">Ya has participado</button>`
        : `<a href="/estudiante/votar/${encuesta.id}" class="block text-center w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Participar</a>`;

    return `
        <div class="bg-white border p-6 rounded shadow-md">
            <h2 class="font-bold text-xl">${encuesta.titulo}</h2>
            <p class="text-gray-600 text-sm mb-4">${encuesta.descripcion}</p>
            <div class="bg-gray-50 p-3 rounded mb-4">
                <span class="text-xs font-bold text-gray-500">MATERIAS:</span>
                <ul class="text-sm mt-2">${listaMaterias}</ul>
            </div>
            ${boton}
        </div>
    `;
}

async function obtenerEncuestasEstudiante() {
    try {
        const response = await fetch('/api/encuestas/mostrar-encuestas');
        const result = await response.json();

        const contenedor = document.getElementById('contenedor-encuestas');
        
        // PROTECCIÓN: Si el contenedor no existe en el HTML, no seguimos
        if (!contenedor) {
            console.error("Error: No se encontró el elemento 'contenedor-encuestas' en el HTML.");
            return;
        }

        contenedor.innerHTML = ''; 

        if (result.status === "ok") {
            // ... resto de tu lógica para pintar las encuestas
            console.log("Datos recibidos:", result.data);
        }
    } catch (error) {
        console.error("Error de conexión:", error);
    }
}

async function validarVotos(encuestaId, form) {
    const checks = form.querySelectorAll('.materia-checkbox:checked');
    const errorMsg = document.getElementById('error-msg-' + encuestaId);

    // 1. Validación local
    if (checks.length < 1 || checks.length > 3) {
        errorMsg.classList.remove('hidden');
        return false;
    }
    errorMsg.classList.add('hidden');

    // 2. Preparar datos para el envío
    const materiasSeleccionadas = Array.from(checks).map(chk => chk.value);

    try {
        const response = await fetch('/api/encuestas/votar-encuestas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                encuestaId: encuestaId,
                materias: materiasSeleccionadas
            })
        });

        const result = await response.json();

        if (result.status === "ok") {
            Swal.fire('¡Éxito!', 'Tu voto ha sido registrado correctamente.', 'success')
                .then(() => location.reload()); // Recargamos para que aparezca "Esperando resultados"
        } else {
            Swal.fire('Error', result.message || 'No se pudo registrar el voto', 'error');
        }
    } catch (error) {
        console.error("Error en la votación:", error);
        Swal.fire('Error de conexión', 'Hubo un problema al conectar con el servidor', 'error');
    }

    return false; // Evita el submit tradicional del formulario
}

// Control dinámico de checkboxes (se mantiene similar pero optimizado)
function controlarCheckboxes(encuestaId) {
    const modal = document.getElementById('modal-' + encuestaId);
    const allChecks = modal.querySelectorAll('.materia-checkbox');
    const checked = modal.querySelectorAll('.materia-checkbox:checked');

    allChecks.forEach(chk => {
        if (checked.length >= 3 && !chk.checked) {
            chk.disabled = true;
            chk.parentElement.classList.add('opacity-50');
        } else {
            chk.disabled = false;
            chk.parentElement.classList.remove('opacity-50');
        }
    });
}



document.addEventListener('DOMContentLoaded', () => {
    // tu código de checkboxes 
        document.body.addEventListener('change', (e) => {
        if (e.target.classList.contains('materia-checkbox')) {
            // El ID del modal suele ser "modal-ID", extraemos el ID
            const encuestaId = e.target.closest('[id^="modal-"]').id.replace('modal-', '');
            controlarCheckboxes(encuestaId);
        }
    });

    // Cerrar modales al hacer clic fuera del contenido blanco
    window.onclick = function(event) {
        if (event.target.id.startsWith('modal-')) {
            event.target.classList.add('hidden');
        }
    }
});