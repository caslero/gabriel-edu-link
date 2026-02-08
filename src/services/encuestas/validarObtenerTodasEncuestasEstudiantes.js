import obtenerDatosUsuarioToken from "../../libs/obtenerDatosUsuarioToken.js";
import respuestasAlBack from "../../utils/respuestasAlBack.js";

export default async function validarObtenerTodasEncuestasEstudiantes(req) {
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

    if (validaciones.rolId !== 3) {
      return respuestasAlBack("error", "Usuario no tiene permisos", {
        codigo: 403,
      });
    }

    return respuestasAlBack(
      "ok",
      "Validacion correcta obtener todas encuestas estudiantes",
      {
        usuarioId: validaciones.usuarioId,
      },
    );
  } catch (error) {
    console.error(
      "Error interno validar obtener encuestas estudiantes:",
      error,
    );

    return respuestasAlBack(
      "error",
      "Error interno validar obtener encuestas estudiantes",
    );
  }
}
