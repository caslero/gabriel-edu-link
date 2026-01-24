import obtenerDatosUsuarioToken from "../../libs/obtenerDatosUsuarioToken.js";
import { MateriaModel } from "../../models/MateriaModel.js";
import respuestasAlBack from "../../utils/respuestasAlBack.js";
import validarCamposCrearMateria from "./validarCamposCrearMateria.js";

export default async function validarCrearMateria(req) {
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

    const { nombre, semestre } = req.body;

    const validarCampos = await validarCamposCrearMateria(nombre, semestre);

    if (validarCampos.status === "error") {
      return respuestasAlBack(validarCampos.status, validarCampos.message);
    }

    const materiaExiste = await MateriaModel.buscarMateriaPorNombre(nombre);

    if (materiaExiste) {
      return respuestasAlBack("error", "Materia ya existe", {
        codigo: 409,
      });
    }

    return respuestasAlBack("ok", "Validacion correcta crear materia", {
      usuarioId: validaciones.usuarioId,
      nombre: validarCampos.nombre,
      semestre: validarCampos.semestre,
    });
  } catch (error) {
    console.error("Error interno validar crear materia:", error);

    return respuestasAlBack("error", "Error interno validar crear materia...");
  }
}
