import obtenerDatosUsuarioToken from "../../libs/obtenerDatosUsuarioToken.js";
import { MateriaModel } from "../../models/MateriaModel.js";
import respuestasAlBack from "../../utils/respuestasAlBack.js";
import ValidarCampos from "../ValidarCampos.js";

export default async function validarEliminarMateria(req) {
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

    const { idMateria } = req.body;

    const validarCampos = ValidarCampos.validarCampoId(
      idMateria,
      "materia a eliminar",
    );

    if (validarCampos.status === "error") {
      return respuestasAlBack(validarCampos.status, validarCampos.message);
    }

    const materiaExiste = await MateriaModel.buscarMateriaPorId(
      validarCampos.id,
    );

    if (!materiaExiste) {
      return respuestasAlBack("error", "Error materia a eliminar no existe", {
        codigo: 409,
      });
    }

    return respuestasAlBack("ok", "Validacion correcta eliminar materia", {
      id: validarCampos.id,
    });
  } catch (error) {
    console.error("Error interno validar eliminar materia:", error);

    return respuestasAlBack("error", "Error interno validar eliminar materia");
  }
}
