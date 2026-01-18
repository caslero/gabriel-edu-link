import obtenerDatosUsuarioToken from "../../libs/obtenerDatosUsuarioToken.js";
import respuestasAlBack from "../../utils/respuestasAlBack.js";

export default async function validarObtenerTodosRoles(req) {
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

    if (validaciones.rolId !== 1) {
      return respuestasAlBack("error", "Usuario no tiene permisos...", {
        codigo: 403,
      });
    }

    return respuestasAlBack(
      "ok",
      "Validacion obtener todos los roles correcta...",
      {},
    );
  } catch (error) {
    console.error("Error interno validar obtener todos los roles:", error);

    return respuestasAlBack(
      "error",
      "Error interno validar obtener todos los roles...",
    );
  }
}
