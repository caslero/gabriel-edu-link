import obtenerDatosUsuarioToken from "../../libs/obtenerDatosUsuarioToken.js";
import respuestasAlBack from "../../utils/respuestasAlBack.js";
import ValidarCampos from "../ValidarCampos.js";

export default async function validarObtenerEstudianteCedula(req) {
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

    const { cedula, pais } = req.body;

    const paisBit = pais === "V" || pais === "v" ? 1 : 0;

    if (pais === "V" || pais === "v") {
      return respuestasAlBack(
        "error",
        "Error nacionalidad deber ser venezolano o extranjero",
        {},
      );
    }

    const validarCedula = ValidarCampos.validarCampoCedula(cedula);

    if (validarCedula.status === "error") {
      return respuestasAlBack(validarCedula.status, validarCedula.message, {});
    }

    return respuestasAlBack(
      "ok",
      "Validacion correcta al obtener estudiante por cedula",
      { cedula: validarCedula.cedula, pais: paisBit },
    );
  } catch (error) {
    console.error(
      "Error interno validar obtener estudiante por cedula:",
      error,
    );
    return respuestasAlBack(
      "error",
      "Error interno validar obtener estudiante por cedula",
    );
  }
}
