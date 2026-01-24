// src/utils/validarCamposCrearMateria.js
import respuestasAlBack from "../../utils/respuestasAlBack.js";
import ValidarCampos from "../ValidarCampos.js";

export default async function validarCamposCrearMateria(nombre, semestre) {
  try {
    // 1. Validaciones individuales usando la clase
    const validarNombre = ValidarCampos.validarCampoNombre(nombre);
    const validarSemestre = ValidarCampos.validarCampoSemestre(semestre);

    // 2. Retorna el primer error encontrado
    if (validarNombre.status === "error") return validarNombre;
    if (validarSemestre.status === "error") return validarSemestre;

    // 3. Retorna respuesta exitosa con todos los datos validados
    return respuestasAlBack("ok", "Campos validados materia", {
      nombre: validarNombre.nombre,
      semestre: validarSemestre.semestre,
    });
  } catch (error) {
    console.log("Error interno campos registro materia:", error);

    return respuestasAlBack("error", "Error interno campos registro materia");
  }
}
