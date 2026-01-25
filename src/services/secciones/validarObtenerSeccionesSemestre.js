import obtenerDatosUsuarioToken from "../../libs/obtenerDatosUsuarioToken.js";
import respuestasAlBack from "../../utils/respuestasAlBack.js";

export default async function validarObtenerSeccionesSemestre(req) {
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

    return respuestasAlBack(
      "ok",
      "Validacion correcta obtener secciones por semestre",
      {
        usuarioId: validaciones.usuarioId,
      },
    );
  } catch (error) {
    console.error(
      "Error interno validar obtener secciones por semestre:",
      error,
    );

    return respuestasAlBack(
      "error",
      "Error interno validar obtener secciones por semestre",
    );
  }
}
