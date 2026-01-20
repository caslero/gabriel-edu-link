// src/utils/validarCamposRegistro.js
import respuestasAlBack from "../../utils/respuestasAlBack.js";
import ValidarCampos from "../ValidarCampos.js";

export default async function validarCamposActualizarUsuario(req) {
  try {
    const { id, nombre, correo, rol_id } = req.body;
    // 1. Validaciones individuales usando la clase
    const validarId = ValidarCampos.validarCampoId(id, "usuario");
    const validarCorreo = ValidarCampos.validarCampoCorreo(correo);
    const validarNombre = ValidarCampos.validarCampoNombre(nombre);
    const validarIdRol = ValidarCampos.validarCampoId(rol_id, "rol");

    // 2. Retorna el primer error encontrado
    if (validarId.status === "error") return validarId;
    if (validarNombre.status === "error") return validarNombre;
    if (validarCorreo.status === "error") return validarCorreo;
    if (validarIdRol.status === "error") return validarIdRol;

    // 3. Retorna respuesta exitosa con todos los datos validados
    return respuestasAlBack("ok", "Campos validados actualizar", {
      id: validarId.id,
      nombre: validarNombre.nombre,
      correo: validarCorreo.correo,
      rol_id: validarIdRol.id,
    });
  } catch (error) {
    console.log("Error interno campos actualizar usuario:", error);

    return respuestasAlBack("error", "Error interno campos actualizar usuario");
  }
}
