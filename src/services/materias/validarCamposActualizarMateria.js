// src/utils/validarCamposRegistro.js
import respuestasAlBack from "../../utils/respuestasAlBack.js";
import ValidarCampos from "../ValidarCampos.js";

export default async function validarCamposActualizarMateria(req) {
  try {
    const { id, nombre, semestre } = req.body;

    // 1. Validaciones individuales usando la clase
    const validarId = ValidarCampos.validarCampoId(id, "materia");
    const validarNombre = ValidarCampos.validarCampoNombre(nombre);
    const validarSemestre = ValidarCampos.validarCampoSemestre(semestre);

    // 2. Retorna el primer error encontrado
    if (validarId.status === "error") return validarId;
    if (validarNombre.status === "error") return validarNombre;
    if (validarSemestre.status === "error") return validarSemestre;

    // 3. Retorna respuesta exitosa con todos los datos validados
    return respuestasAlBack("ok", "Campos validados actualizar materia", {
      id: validarId.id,
      nombre: validarNombre.nombre,
      semestre: validarSemestre.semestre,
    });
  } catch (error) {
    console.log("Error interno campos actualizar materia:", error);

    return respuestasAlBack("error", "Error interno campos actualizar materia");
  }
}
