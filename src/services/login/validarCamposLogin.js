// src/utils/validarCamposRegistro.js
import respuestasAlBack from "../../utils/respuestasAlBack.js";
import ValidarCampos from "../ValidarCampos.js";

export default function validarCamposLogin(correo, clave) {
  try {
    // 1. Validaciones individuales usando la clase
    const validarCorreo = ValidarCampos.validarCampoCorreo(correo);

    // 2. Retorna el primer error encontrado
    if (validarCorreo.status === "error") return validarCorreo;

    if (!clave) {
      return respuestasAlBack("error", "Campo clave vacio");
    }

    // 3. Retorna respuesta exitosa con todos los datos validados
    return respuestasAlBack("ok", "Campos validados...", {
      correo: validarCorreo.correo,
      clave: clave,
    });
  } catch (error) {
    console.log("Error interno, validar campos login:", error);

    return respuestasAlBack("error", "Error interno validar campos login");
  }
}
