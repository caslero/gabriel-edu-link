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
                        <button onclick="abrirModalEditar('${encuesta.id}')" class="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600 transition">Editar</button>
                        <button onclick="eliminarEncuesta('${encuesta.id}')" class="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700 transition">Eliminar</button>
                    </td>
                </tr>`;
            }).join('');
        }
    } catch (err) {
        console.error("Error al listar encuestas:", err);
    }
}

// --- 4. ACCIONES DE EDICIÓN Y ELIMINACIÓN ---

function abrirModalEditar(id) {
    const modal = document.getElementById(`modal-${id}`);
    if (modal) modal.classList.remove('hidden');
}

function cerrarModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('hidden');
}

function filtrarMateriasEditar(encuestaId, semestre) {
    const items = document.querySelectorAll(`.item-edit-${encuestaId}`);
    items.forEach(item => {
        const match = item.getAttribute('data-semestre') == semestre;
        item.classList.toggle('hidden', !match);
        if (!match) {
            const cb = item.querySelector('input');
            if (cb) cb.checked = false;
        }
    });
}

async function actualizarEncuesta(e, id) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const dataObj = Object.fromEntries(formData.entries());
    
    // Aseguramos que el ID vaya en el objeto y las materias sean array
    dataObj.id = id; 
    dataObj.materias = formData.getAll('materias[]');

    try {
        const res = await fetch('/api/encuestas/actualizar-encuesta', { 
            method: 'PATCH', // Cambiado a PATCH
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dataObj)
        });
        const result = await res.json();

        if (result.status === 'ok') {
            mostrarNotificacion("Cambios guardados");
            setTimeout(() => location.reload(), 1000);
        } else {
            alert(result.message);
        }
    } catch (err) {
        console.error(err);
    }
}

async function eliminarEncuesta(id) {
    if (!confirm("¿Seguro que deseas eliminar esta encuesta?")) return;

    try {
        const res = await fetch('/api/encuestas/eliminar-encuesta', { 
            method: 'PATCH', // Cambiado a PATCH según tu ruta
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id }) // Enviamos el ID en el body
        });

        const result = await res.json();
        if (result.status === 'ok') {
            mostrarNotificacion("Encuesta eliminada");
            setTimeout(() => location.reload(), 1000);
        }
    } catch (err) {
        console.error("Error:", err);
    }
}

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