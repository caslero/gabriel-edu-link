// src/utils/validarCamposRegistro.js
import CifrarDescifrarClaves from "../../libs/CifrarDescifrarClaves";
import respuestasAlBack from "../../utils/respuestasAlBack";
import ValidarCampos from "../ValidarCampos";

export default async function validarCamposCrearUsuario(
  cedula,
  nombre,
  correo,
  claveUno,
  claveDos,
  rol,
  pathImg
) {
  try {
    // 1. Validaciones individuales usando la clase
    const validarCedula = ValidarCampos.validarCampoCedula(cedula);
    const validarCorreo = ValidarCampos.validarCampoCorreo(correo);
    const validarNombre = ValidarCampos.validarCampoNombre(nombre);
    const validarClave = ValidarCampos.validarCampoClave(claveUno, claveDos);
    const validarIdRol = ValidarCampos.validarCampoId(rol, "rol");

    // 2. Retorna el primer error encontrado
    if (validarCedula.status === "error") return validarCedula;
    if (validarNombre.status === "error") return validarNombre;
    if (validarCorreo.status === "error") return validarCorreo;
    if (validarClave.status === "error") return validarClave;
    if (validarIdRol.status === "error") return validarIdRol;

    const claveCifrada = await CifrarDescifrarClaves.cifrarClave(claveUno);

    if (claveCifrada.status === "error") {
      return respuestasAlBack(claveCifrada.status, claveCifrada.message);
    }

    // 3. Retorna respuesta exitosa con todos los datos validados
    return respuestasAlBack("ok", "Campos validados...", {
      cedula: validarCedula.cedula,
      nombre: validarNombre.nombre,
      correo: validarCorreo.correo,
      claveEncriptada: claveCifrada.claveEncriptada,
      id_rol: validarIdRol.id,
      pathImg: pathImg,
    });
  } catch (error) {
    console.log("Error interno, campos registro usuario:", error);

    return respuestasAlBack("error", "Error interno en validación de usuario");
  }
}
