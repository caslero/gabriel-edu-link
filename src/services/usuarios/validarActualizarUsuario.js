import obtenerDatosUsuarioToken from "../../libs/obtenerDatosUsuarioToken.js";
import { UserModel } from "../../models/UserModel.js";
import respuestasAlBack from "../../utils/respuestasAlBack.js";
import validarCamposActualizarUsuario from "./validarCamposActualizarUsuario.js";

export default async function validarActualizarUsuario(req) {
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

    const validarCampos = await validarCamposActualizarUsuario(req);

    if (validarCampos.status === "error") {
      return respuestasAlBack(validarCampos.status, validarCampos.message);
    }

    const usuarioExiste = await UserModel.buscarUsuarioActualizar(
      validaciones.correo,
      validaciones.id,
    );

    if (usuarioExiste) {
      return respuestasAlBack("error", "Error otro usuario tiene este correo", {
        codigo: 409,
      });
    }

    return respuestasAlBack("ok", "Validacion actualizar usuario correcta...", {
      id: validarCampos.id,
      nombre: validarCampos.nombre,
      correo: validarCampos.correo,
      rol_id: validarCampos.rol_id,
    });
  } catch (error) {
    console.error("Error interno validar actualizar usuario:", error);

    return respuestasAlBack(
      "error",
      "Error interno validar actualizar usuario...",
    );
  }
}
