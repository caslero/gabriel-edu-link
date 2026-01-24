// src/utils/validarCamposCrearMateria.js
import respuestasAlBack from "../../utils/respuestasAlBack.js";
import ValidarCampos from "../ValidarCampos.js";

export default async function validarCamposCrearSeccion(
  materia_id,
  seccion_nombre,
  cupos,
) {
  try {
    // 1. Validaciones individuales usando la clase
    const validarIdMateria = ValidarCampos.validarCampoId(
      materia_id,
      "materia",
    );
    const validarNombre = ValidarCampos.validarCampoNombre(seccion_nombre);
    const validarCupos = ValidarCampos.validarCampoCupo(cupos);

    // 2. Retorna el primer error encontrado
    if (validarIdMateria.status === "error") return validarIdMateria;
    if (validarNombre.status === "error") return validarNombre;
    if (validarCupos.status === "error") return validarCupos;

    // 3. Retorna respuesta exitosa con todos los datos validados
    return respuestasAlBack("ok", "Campos validados seccion", {
      materiaId: validarIdMateria.id,
      nombre: validarNombre.nombre,
      cupos: validarCupos.cupo,
    });
  } catch (error) {
    console.log("Error interno campos crear seccion:", error);

    return respuestasAlBack("error", "Error interno campos crear seccion");
  }
}
