import obtenerDatosUsuarioToken from "../../libs/obtenerDatosUsuarioToken.js";
import { SeccionModel } from "../../models/SeccionModel.js";
import respuestasAlBack from "../../utils/respuestasAlBack.js";
import ValidarCampos from "../ValidarCampos.js";

export default async function validarEliminarSeccion(req) {
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
      return respuestasAlBack(
        "error",
        "Error usuario no tiene permisos de eliminar",
        {
          codigo: 403,
        },
      );
    }

    const { idSeccion } = req.body;

    const validarCampos = ValidarCampos.validarCampoId(
      idSeccion,
      "seccion a eliminar",
    );

    if (validarCampos.status === "error") {
      return respuestasAlBack(validarCampos.status, validarCampos.message);
    }

    const seccionExiste = await SeccionModel.buscarSeccionPorId(
      validarCampos.id,
    );

    if (!seccionExiste) {
      return respuestasAlBack("error", "Error seccion a eliminar no existe", {
        codigo: 409,
      });
    }

    return respuestasAlBack("ok", "Validacion correcta eliminar seccion", {
      id: validarCampos.id,
    });
  } catch (error) {
    console.error("Error interno validar eliminar seccion:", error);

    return respuestasAlBack("error", "Error interno validar eliminar seccion");
  }
}
