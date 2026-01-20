document.addEventListener('DOMContentLoaded', () => {
    const formActa = document.getElementById('form-acta-especial');

    // --- CREAR NUEVA ACTA ---
    if (formActa) {
        formActa.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(formActa);
            const payload = Object.fromEntries(formData.entries());

            try {
                const res = await fetch('/api/actas-especiales/crear', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const data = await res.json();

                if (data.status === "ok") {
                    mostrarNotificacion("Acta creada exitosamente");
                    setTimeout(() => location.reload(), 1500);
                } else {
                    mostrarNotificacion(data.message || "Error al crear", "error");
                }
            } catch (err) {
                mostrarNotificacion("Error de conexión al servidor", "error");
            }
        });
    }
});

// --- GESTIONAR PENDIENTES (APROBAR/RECHAZAR) ---
async function gestionarActa(id, accion) {
    const confirmacion = confirm(`¿Estás seguro de que deseas ${accion.toLowerCase()} esta acta?`);
    if (!confirmacion) return;

    try {
        const res = await fetch(`/api/actas-especiales/gestionar`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, accion }) // accion: 'Aprobar' o 'Rechazar'
        });
        const data = await res.json();

        if (data.status === "ok") {
            mostrarNotificacion(`Acta ${accion === 'Aprobar' ? 'aprobada' : 'rechazada'} correctamente`);
            setTimeout(() => location.reload(), 1000);
        } else {
            mostrarNotificacion(data.message, "error");
        }
    } catch (err) {
        mostrarNotificacion("Error al procesar la solicitud", "error");
    }
}

// --- ELIMINAR ACTA ---
async function eliminarActa(id) {
    if (!confirm('¿Deseas eliminar permanentemente esta acta?')) return;

    try {
        const res = await fetch(`/api/actas-especiales/eliminar`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });

        if (res.ok) {
            mostrarNotificacion("Acta eliminada correctamente");
            setTimeout(() => location.reload(), 1000);
        } else {
            mostrarNotificacion("No se pudo eliminar el acta", "error");
        }
    } catch (err) {
        mostrarNotificacion("Error de red", "error");
    }
}

// --- UTILIDAD: NOTIFICACIONES (TOAST) ---
function mostrarNotificacion(mensaje, tipo = 'exito') {
    const color = tipo === 'exito' ? 'bg-green-600' : 'bg-red-600';
    const toast = document.createElement('div');
    toast.className = `fixed bottom-5 right-5 ${color} text-white px-6 py-3 rounded-lg shadow-2xl z-50 transition-opacity duration-500`;
    toast.innerHTML = `<span class="font-bold">${mensaje}</span>`;
    
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}