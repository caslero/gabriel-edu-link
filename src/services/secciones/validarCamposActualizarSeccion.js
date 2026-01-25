// src/utils/validarCamposRegistro.js
import respuestasAlBack from "../../utils/respuestasAlBack.js";
import ValidarCampos from "../ValidarCampos.js";

export default async function validarCamposActualizarSeccion(req) {
  try {
    const { id, materia_id, nombre, cupos } = req.body;

    // 1. Validaciones individuales usando la clase
    const validarIdSeccion = ValidarCampos.validarCampoId(id, "seccion");
    const validarNombre = ValidarCampos.validarCampoSemestre(nombre, "sección");
    const validarIdMateria = ValidarCampos.validarCampoId(
      materia_id,
      "materia",
    );
    const validarCupos = ValidarCampos.validarCampoCupo(cupos, "cupos");

    // 2. Retorna el primer error encontrado
    if (validarIdSeccion.status === "error") return validarIdSeccion;
    if (validarNombre.status === "error") return validarNombre;
    if (validarIdMateria.status === "error") return validarIdMateria;
    if (validarCupos.status === "error") return validarCupos;

    // 3. Retorna respuesta exitosa con todos los datos validados
    return respuestasAlBack("ok", "Campos validados actualizar seccion", {
      id: validarIdSeccion.id,
      nombre: validarNombre.semestre,
      materiaId: validarIdMateria.id,
      cupos: validarCupos.cupo,
    });
  } catch (error) {
    console.log("Error interno campos actualizar sección:", error);

    return respuestasAlBack("error", "Error interno campos actualizar sección");
  }
}
