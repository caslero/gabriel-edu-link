// src/utils/validarCamposRegistro.js
import respuestasAlBack from "../../utils/respuestasAlBack";
import ValidarCampos from "../ValidarCampos";

export default function validarCamposLogin(correo, clave) {
  try {
    // 1. Validaciones individuales usando la clase
    const validarCoreo = ValidarCampos.validarCampoCorreo(correo);

    // 2. Retorna el primer error encontrado
    if (validarCoreo.status === "error") return validarCoreo;

    if (!clave) {
      return respuestasAlBack("error", "Campo clave vacio");
    }

    // 3. Retorna respuesta exitosa con todos los datos validados
    return respuestasAlBack("ok", "Campos validados...", {
      correo: validarCoreo.correo,
      clave: clave,
    });
  } catch (error) {
    console.log("Error interno, validar campos login:", error);

    return respuestasAlBack("error", "Error interno validar campos login");
  }
}
