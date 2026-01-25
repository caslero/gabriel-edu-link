import obtenerDatosUsuarioToken from "../../libs/obtenerDatosUsuarioToken.js";
import { SeccionModel } from "../../models/SeccionModel.js";
import respuestasAlBack from "../../utils/respuestasAlBack.js";
import validarCamposCrearSeccion from "./validarCamposCrearSeccion.js";

export default async function validarCrearSeccion(req) {
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

    const { materia_id, seccion_nombre, cupos } = req.body;

    const validarCampos = await validarCamposCrearSeccion(
      materia_id,
      seccion_nombre,
      cupos,
    );

    if (validarCampos.status === "error") {
      return respuestasAlBack(validarCampos.status, validarCampos.message);
    }

    const seccionExiste = await SeccionModel.buscarSeccionNombreId(
      validarCampos.nombre,
      validarCampos.materiaId,
    );

    if (seccionExiste) {
      return respuestasAlBack("error", "Seccion ya existe", {
        codigo: 409,
      });
    }

    return respuestasAlBack("ok", "Validacion correcta crear seccion", {
      usuarioId: validaciones.usuarioId,
      materiaId: validarCampos.materiaId,
      nombre: validarCampos.nombre,
      cupos: validarCampos.cupos,
    });
  } catch (error) {
    console.error("Error interno validar crear seccion:", error);

    return respuestasAlBack("error", "Error interno validar crear seccion...");
  }
}
