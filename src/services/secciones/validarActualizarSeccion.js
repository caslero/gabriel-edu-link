import obtenerDatosUsuarioToken from "../../libs/obtenerDatosUsuarioToken.js";
import { SeccionModel } from "../../models/SeccionModel.js";
import respuestasAlBack from "../../utils/respuestasAlBack.js";
import validarCamposActualizarSeccion from "./validarCamposActualizarSeccion.js";

export default async function validarActualizarSeccion(req) {
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
        "Error usuario no tiene permisos de actualizar",
        {},
        403,
      );
    }

    const validarCampos = await validarCamposActualizarSeccion(req);

    if (validarCampos.status === "error") {
      return respuestasAlBack(validarCampos.status, validarCampos.message);
    }

    const seccionExiste = await SeccionModel.buscarSeccionActualizar(
      validaciones.nombre,
      validaciones.id,
      validaciones.materiaId,
    );

    if (seccionExiste) {
      return respuestasAlBack("error", "Error otra seccion tiene este nombre", {
        codigo: 409,
      });
    }

    return respuestasAlBack("ok", "Validacion correcta actualizar seccion", {
      usuarioId: validaciones.usuarioId,
      id: validarCampos.id,
      nombre: validarCampos.nombre,
      materiaId: validarCampos.materiaId,
      cupos: validarCampos.cupos,
    });
  } catch (error) {
    console.error("Error interno validar actualizar seccion:", error);

    return respuestasAlBack(
      "error",
      "Error interno validar actualizar seccion",
    );
  }
}
