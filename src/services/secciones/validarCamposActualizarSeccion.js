// src/utils/validarCamposRegistro.js
import respuestasAlBack from "../../utils/respuestasAlBack.js";
import ValidarCampos from "../ValidarCampos.js";

export default async function validarCamposActualizarSeccion(req) {
  try {
    const { id, nombre_seccion, materia_id } = req.body;

    // 1. Validaciones individuales usando la clase
    const validarIdSeccion = ValidarCampos.validarCampoId(id, "seccion");
    const validarNombre = ValidarCampos.validarCampoNombre(nombre_seccion);
    const validarIdMateria = ValidarCampos.validarCampoId(
      materia_id,
      "materia",
    );

    // 2. Retorna el primer error encontrado
    if (validarIdSeccion.status === "error") return validarIdSeccion;
    if (validarNombre.status === "error") return validarNombre;
    if (validarIdMateria.status === "error") return validarIdMateria;

    // 3. Retorna respuesta exitosa con todos los datos validados
    return respuestasAlBack("ok", "Campos validados actualizar seccion", {
      id: validarIdSeccion.id,
      nombre: validarNombre.nombre,
      materiaId: validarIdMateria.id,
    });
  } catch (error) {
    console.log("Error interno campos actualizar sección:", error);

    return respuestasAlBack("error", "Error interno campos actualizar sección");
  }
}
