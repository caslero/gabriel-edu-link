import obtenerDatosUsuarioToken from "../../libs/obtenerDatosUsuarioToken.js";
import respuestasAlBack from "../../utils/respuestasAlBack.js";

export default async function validarGestionarSolicitudInscripcion(req) {
  try {
    const validaciones = await obtenerDatosUsuarioToken(req);

    if (validaciones.status === "error") {
      return respuestasAlBack(
        validaciones.status,
        validaciones.message,
        {},
        validaciones.codigo ? validaciones.codigo : 400,
      );
    }

    const { id } = req.params;
    const { estado, comentario } = req.body;

    const estadosValidos = ["Aprobada", "Rechazada", "Pendiente"];

    return respuestasAlBack(
      "ok",
      "Validacion correcta solicitud inscripcion",
      {},
    );
  } catch (error) {
    console.log("Error interno validar solicitud inscripcion:", error);

    return respuestasAlBack(
      "error",
      "Error interno validar solicitud inscripcion",
      {},
    );
  }
}

/** 
export async function validarGestion(datos) {
  const estadosValidos = ["Aprobada", "Rechazada"];

  // 1. Validar que el estado enviado sea uno de los permitidos
  if (!datos.estado || !estadosValidos.includes(datos.estado)) {
    return {
      status: "error",
      message:
        "Estado de gestión no válido. Solo se permite: " +
        estadosValidos.join(", "),
    };
  }

  // 2. Limpiar el comentario para validación de longitud real
  const comentarioLimpio = datos.comentario ? datos.comentario.trim() : "";

  // 3. Si se rechaza, exigir un motivo justificado (mínimo 5 caracteres reales)
  if (datos.estado === "Rechazada") {
    if (!comentarioLimpio || comentarioLimpio.length < 5) {
      return {
        status: "error",
        message:
          "Debe incluir un motivo válido (mínimo 5 caracteres) para rechazar la solicitud.",
      };
    }
  }

  return { status: "ok" };
}
*/
