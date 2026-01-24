import obtenerDatosUsuarioToken from "../../libs/obtenerDatosUsuarioToken.js";
import respuestasAlBack from "../../utils/respuestasAlBack.js";

export default async function validarObtenerMateriasSemestre(req) {
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
      "Validacion correcta obtener materias por semestre",
      {
        usuarioId: validaciones.usuarioId,
      },
    );
  } catch (error) {
    console.error(
      "Error interno validar obtener materias por semestre:",
      error,
    );

    return respuestasAlBack(
      "error",
      "Error interno validar obtener materias por semestre",
    );
  }
}
