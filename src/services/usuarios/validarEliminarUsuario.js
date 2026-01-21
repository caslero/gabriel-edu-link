import obtenerDatosUsuarioToken from "../../libs/obtenerDatosUsuarioToken.js";
import { UserModel } from "../../models/UserModel.js";
import respuestasAlBack from "../../utils/respuestasAlBack.js";
import ValidarCampos from "../ValidarCampos.js";

export default async function validarEliminarUsuario(req) {
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

    const { idUsuario } = req.body;

    const validarCampos = ValidarCampos.validarCampoId(
      idUsuario,
      "usuario a eliminar",
    );

    if (validarCampos.status === "error") {
      return respuestasAlBack(validarCampos.status, validarCampos.message);
    }

    const usuarioExiste = await UserModel.buscarUsuarioPorId(validarCampos.id);

    if (!usuarioExiste) {
      return respuestasAlBack("error", "Error usuario a eliminar no existe", {
        codigo: 409,
      });
    }

    return respuestasAlBack("ok", "Validacion eliminar usuario correcta...", {
      id: validarCampos.id,
    });
  } catch (error) {
    console.error("Error interno validar eliminar usuario:", error);

    return respuestasAlBack(
      "error",
      "Error interno validar eliminar usuario...",
    );
  }
}
