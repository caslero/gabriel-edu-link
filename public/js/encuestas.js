document.addEventListener('DOMContentLoaded', () => {
    // Inicialización
    cargarSemestres();
    listarEncuestas();

    const formCrear = document.getElementById('form-crear-encuesta');
    const semestreSelect = document.getElementById('semestre');

    // --- 1. FILTRADO DINÁMICO (CREACIÓN) ---
    if (semestreSelect) {
        semestreSelect.addEventListener('change', async (e) => {
            const semestre = e.target.value;
            const contenedor = document.getElementById('materias-container');
            const listaMaterias = document.getElementById('materias-list');
            
            listaMaterias.innerHTML = ''; 

            if (!semestre) {
                contenedor.classList.add('hidden');
                return;
            }

            try {
                const res = await fetch(`/api/encuestas/listar-materias?semestre=${semestre}`);
                const result = await res.json();

                if (result.status === 'ok' && Array.isArray(result.data)) {
                    contenedor.classList.remove('hidden');
                    
                    if (result.data.length === 0) {
                        listaMaterias.innerHTML = '<p class="text-gray-500 text-sm">No hay materias para este semestre.</p>';
                        return;
                    }

                    listaMaterias.innerHTML = result.data.map(mat => `
                        <div class="flex items-center p-2 bg-gray-50 rounded mb-1 border border-gray-100">
                            <input type="checkbox" id="mat-${mat.id}" name="materias[]" value="${mat.id}" class="mr-2 h-4 w-4 text-blue-600">
                            <label for="mat-${mat.id}" class="text-sm cursor-pointer">${mat.nombre}</label>
                        </div>
                    `).join('');
                }
            } catch (err) {
                console.error("Error al filtrar materias:", err);
            }
        });
    }

    // --- 2. PETICIÓN: CREAR ENCUESTA ---
    if (formCrear) {
        formCrear.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(formCrear);
            const dataObj = Object.fromEntries(formData.entries());
            dataObj.materias = formData.getAll('materias[]');

            try {
                const res = await fetch('/api/encuestas/crear-encuesta', { 
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(dataObj)
                });
                const result = await res.json();

                if (result.status === 'ok') {
                    mostrarNotificacion("Encuesta creada correctamente", "exito");
                    setTimeout(() => location.reload(), 1500);
                } else {
                    mostrarNotificacion(result.message || "Error al crear", "error");
                }
            } catch (err) {
                mostrarNotificacion("Error de conexión al servidor", "error");
            }
        });
    }
});

// --- 3. CARGA DE DATOS INICIALES ---

async function cargarSemestres() {
    const selectSemestre = document.getElementById('semestre');
    if (!selectSemestre) return;

    try {
        const res = await fetch('/api/encuestas/obtener-semestres');
        const result = await res.json();

        if (result.status === "ok") {
            selectSemestre.innerHTML = '<option value="">Seleccione un semestre</option>';
            result.data.forEach(item => {
                const option = document.createElement('option');
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
    const tbody = document.querySelector('table tbody');
    if (!tbody) return;

    try {
        const res = await fetch('/api/encuestas/listar-encuestas');
        const result = await res.json();

        if (result.status === 'ok') {
            const encuestas = result.data;
            if (encuestas.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" class="text-center py-6 text-gray-500">No hay encuestas registradas.</td></tr>';
                return;
            }

            tbody.innerHTML = encuestas.map(encuesta => {
                const estadoClass = encuesta.estado === 'Activa' ? 'bg-green-100 text-green-700' : 
                                   encuesta.estado === 'Pendiente' ? 'bg-yellow-100 text-yellow-700' : 
                                   'bg-red-100 text-red-700';

                return `
                <tr class="hover:bg-gray-50 transition border-b">
                    <td class="px-4 py-2 text-center text-sm">${encuesta.id}</td>
                    <td class="px-4 py-2 text-center font-medium text-sm text-blue-900">${encuesta.titulo}</td>
                    <td class="px-4 py-2 text-center text-sm">${encuesta.semestre}</td>
                    <td class="px-4 py-2 text-center text-sm">${encuesta.fecha_inicio}</td>
                    <td class="px-4 py-2 text-center text-sm">${encuesta.fecha_fin}</td>
                    <td class="px-4 py-2 text-center">
                        <span class="px-3 py-1 rounded-full text-xs font-bold ${estadoClass}">
                            ${encuesta.estado}
                        </span>
                    </td>
                    <td class="px-4 py-2 text-center space-x-1">
                        <button 
                            onclick="window.abrirModalEditar(${encuesta.id})"
                            class="bg-yellow-500 text-white px-2 py-1 rounded">
                            Editar
                        </button>
                        <button onclick="eliminarEncuesta('${encuesta.id}')" class="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700 transition">Eliminar</button>
                    </td>
                </tr>`;
            }).join('');
        }
    } catch (err) {
        console.error("Error al listar encuestas:", err);
    }
}

// --- FUNCIONES GLOBALES ---

window.abrirModalEditar = async function(id) {
    const modal = document.getElementById('modal-editar-global');
    if (!modal) return console.error("No existe el modal global");

    // Mostrar el modal primero para dar feedback visual
    modal.classList.remove('hidden');
    console.log("Cargando datos encuesta ID:", id);

    try {
        // CAMBIO AQUÍ: Usa /obtener/${id} en lugar de /actualizar-encuesta
        const res = await fetch(`/api/encuestas/obtener/${id}`);
        
        // Verificamos si la respuesta es correcta antes de parsear JSON
        if (!res.ok) throw new Error(`Error en el servidor: ${res.status}`);

        const result = await res.json();

        if (result.status === 'ok') {
            const e = result.data;
            
            // Llenar los campos del modal
            document.getElementById('edit-id').value = e.id;
            document.getElementById('edit-titulo').value = e.titulo;
            
            // Si tienes estos campos, asegúrate de que el ID coincida en el HTML
            if(document.getElementById('edit-descripcion')) 
                document.getElementById('edit-descripcion').value = e.descripcion || "";

            // Cargar materias asociadas
            await cargarMateriasEdicion(e.semestre, e.materias_seleccionadas);
        }
    } catch (err) { 
        console.error("Error al cargar datos del modal:", err);
        alert("No se pudieron cargar los datos de la encuesta.");
    }
}
window.eliminarEncuesta = async function(id) {
    if (!confirm("¿Eliminar encuesta?")) return;
    const res = await fetch('/api/encuestas/eliminar-encuesta', { 
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }) 
    });
    if ((await res.json()).status === 'ok') {
        mostrarNotificacion("Eliminada");
        listarEncuestas();
    }
}

/*document.addEventListener('DOMContentLoaded', () => {
    // Escuchar el envío del formulario de edición
    const formEditar = document.getElementById('form-editar-encuesta');
    if (formEditar) {
        formEditar.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(formEditar);
            const dataObj = Object.fromEntries(formData.entries());
            dataObj.materias = formData.getAll('materias[]');

            try {
                // USANDO TU RUTA EXACTA
                const res = await fetch('/api/encuestas/actualizar-encuestas', {
                    method: 'PATCH', // O POST, según como lo tengas en tu router
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(dataObj)
                });

                const result = await res.json();
                if (result.status === 'ok') {
                    window.cerrarModal('modal-editar-global');
                    mostrarNotificacion("Encuesta actualizada con éxito");
                    listarEncuestas(); // Refresca la tabla
                } else {
                    alert("Error: " + result.message);
                }
            } catch (err) {
                console.error("Error al actualizar:", err);
            }
        });
    }
});

// Función global para abrir el modal
window.abrirModalEditar = async function(id) {
    const modal = document.getElementById('modal-editar-global');
    if (!modal) return console.error("No se encontró el modal global en el DOM");

    try {
        const res = await fetch(`/api/encuestas/actualizar-encuesta`);
        const result = await res.json();

        if (result.status === 'ok') {
            const e = result.data;
            document.getElementById('edit-id').value = e.id;
            document.getElementById('edit-titulo').value = e.titulo;
            document.getElementById('edit-semestre').value = e.semestre;

            // Cargar materias del semestre y marcar las que ya tiene
            await cargarMateriasEdicion(e.semestre, e.materias_seleccionadas);
            
            modal.classList.remove('hidden');
        }
    } catch (err) {
        console.error("Error al cargar datos:", err);
    }
}

// Asegúrate de que esto esté bien escrito en tu archivo JS
window.cerrarModal = function(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.add('hidden');
    } else {
        console.error("No se pudo cerrar, no existe ID:", id);
    }
};
*/
// --- 5. UTILIDADES ---

function mostrarNotificacion(mensaje, tipo = 'exito') {
    const color = tipo === 'exito' ? 'bg-green-600' : 'bg-red-600';
    const toast = document.createElement('div');
    toast.className = `fixed bottom-5 right-5 ${color} text-white px-6 py-3 rounded-lg shadow-2xl z-50 transition-all duration-500`;
    toast.innerHTML = `<span class="font-bold">${mensaje}</span>`;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('opacity-0');
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}