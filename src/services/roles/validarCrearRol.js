import obtenerDatosUsuarioToken from "../../libs/obtenerDatosUsuarioToken.js";
import { RolModel } from "../../models/RolModel.js";
import respuestasAlBack from "../../utils/respuestasAlBack.js";
import ValidarCampos from "../ValidarCampos.js";

export default async function validarCrearRol(nombre, req) {
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

    const validarCampos = ValidarCampos.validarCampoNombre(nombre);

    if (validarCampos.status === "error") {
      return respuestasAlBack(validarCampos.status, validarCampos.message);
    }

    const rolExiste = await RolModel.buscarRolPorNombre(validarCampos.nombre);

    if (rolExiste) {
      return respuestasAlBack("error", "Rol ya existe...", {
        codigo: 409,
      });
    }

    if (validaciones.rolId !== 1) {
      return respuestasAlBack("error", "Usuario no tiene permisos...", {
        codigo: 403,
      });
    }

    return respuestasAlBack("ok", "Validacion crear rol correcta...", {
      nombre: validarCampos.nombre,
    });
  } catch (error) {
    console.error("Error interno validar crear rol:", error);

    return respuestasAlBack("error", "Error interno validar crear rol...");
  }
}
