import { UserModel } from "../../models/UserModel";
import respuestasAlBack from "../../utils/respuestasAlBack";
import tokenCrearUsuario from "./tokenCrearUsuario";
import validarCamposCrearUsuario from "./validarCamposCrearUsuario";

export default async function validarCrearUsuario(
  cedula,
  nombre,
  correo,
  claveUno,
  claveDos,
  rol,
  pathImg
) {
  try {
    const validarCampos = await validarCamposCrearUsuario(
      cedula,
      nombre,
      correo,
      claveUno,
      claveDos,
      rol,
      pathImg
    );

    if (validarCampos.status === "error") {
      return respuestasAlBack(validarCampos.status, validarCampos.message);
    }

    const usuarioExiste = await UserModel.buscarUsuarioPorCorreo(correo);

    if (usuarioExiste) {
      return respuestasAlBack("error", "Usuario ya existe...", {
        codigo: 409,
      });
    }

    const crearToken = await tokenCrearUsuario();

    if (crearToken.status === "error") {
      return respuestasAlBack(crearToken.status, crearToken.message);
    }

    return respuestasAlBack("ok", "Validacion crear usuario correcta...", {
      cedula: validarCampos.cedula,
      nombre: validarCampos.nombre,
      correo: validarCampos.correo,
      claveEncriptada: validarCampos.claveEncriptada,
      id_rol: validarCampos.id_rol,
      pathImg: validarCampos.pathImg,
      token: crearToken.token,
      borrado: false,
    });
  } catch (error) {
    console.error("Error interno validar crear usuario:", error);

    return respuestasAlBack("error", "Error interno validar crear usuario...");
  }
}
