export const validarSolicitud = async (data) => {
    if (!data.usuario_id) return { status: "error", message: "Falta ID de usuario" };
    if (!data.seccion_id) return { status: "error", message: "Falta ID de sección" };
    return { status: "ok" };
};