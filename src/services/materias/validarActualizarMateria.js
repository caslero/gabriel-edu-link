import obtenerDatosUsuarioToken from "../../libs/obtenerDatosUsuarioToken.js";
import { UserModel } from "../../models/UserModel.js";
import respuestasAlBack from "../../utils/respuestasAlBack.js";
import validarCamposActualizarMateria from "./validarCamposActualizarMateria.js";

export default async function validarActualizarMateria(req) {
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

    const validarCampos = await validarCamposActualizarMateria(req);

    if (validarCampos.status === "error") {
      return respuestasAlBack(validarCampos.status, validarCampos.message);
    }

    const materiaExiste = await UserModel.buscarMateriaActualizar(
      validaciones.nombre,
      validaciones.id,
    );

    if (materiaExiste) {
      return respuestasAlBack("error", "Error otra materia tiene este nombre", {
        codigo: 409,
      });
    }

    return respuestasAlBack("ok", "Validacion correcta actualizar materia", {
      id: validarCampos.id,
      nombre: validarCampos.nombre,
      semestre: validarCampos.semestre,
    });
  } catch (error) {
    console.error("Error interno validar actualizar materia:", error);

    return respuestasAlBack(
      "error",
      "Error interno validar actualizar materia",
    );
  }
}
