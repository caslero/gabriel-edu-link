import { InscripcionModel } from "../../models/InscripcionModel.js";
import obtenerDatosUsuarioToken from "../../libs/obtenerDatosUsuarioToken.js";
import respuestasAlBack from "../../utils/respuestasAlBack.js";
import ValidarCampos from "../ValidarCampos.js";

export default async function validarCrearInscripcion(req) {
  try {
    const validaciones = await obtenerDatosUsuarioToken(req);

    if (validaciones.status === "error") {
      return respuestasAlBack(
        validaciones.status,
        validaciones.message,
        {},
        validaciones.codigo ? validaciones.codigo : 400,
      );
    }

    const { estudiante_id, seccion_id } = req.body;

    const validarIdEstudiante = ValidarCampos.validarCampoId(
      estudiante_id,
      "estudiante",
    );

    if (validarIdEstudiante.status === "error") {
      return respuestasAlBack(
        validarIdEstudiante.status,
        validarIdEstudiante.message,
      );
    }

    const validarIdSeccion = ValidarCampos.validarCampoId(
      seccion_id,
      "seccion",
    );

    if (validarIdSeccion.status === "error") {
      return respuestasAlBack(
        validarIdSeccion.status,
        validarIdSeccion.message,
      );
    }

    const seccion = await InscripcionModel.obtenerSeccionPorId(
      validarIdSeccion.id,
    );

    if (!seccion) {
      return respuestasAlBack(
        "error",
        "Error la sección no existe o no está disponible.",
        { codigo: 404 },
      );
    }

    if (seccion?.cupos <= 0) {
      return respuestasAlBack(
        "error",
        "Error no hay cupos disponibles en esta sección",
        { codigo: 404 },
      );
    }

    const yaInscrito = await InscripcionModel.verificarDuplicado(
      validarIdEstudiante.id,
      validarIdSeccion.id,
    );

    if (yaInscrito) {
      return respuestasAlBack(
        "error",
        "Error el estudiante ya está inscrito en esta sección",
        { codigo: 409 },
      );
    }

    return respuestasAlBack("ok", "Validación correcta crear inscripción", {
      usuario_id: validaciones.usuarioId,
      estudiante_id: validarIdEstudiante.id,
      seccion_id: validarIdSeccion.id,
    });
  } catch (error) {
    console.log("Error interno validar crear inscripción:", error);

    return respuestasAlBack("error", "Error interno validar crear inscripción");
  }
}

/** 
import { InscripcionModel } from "../../models/InscripcionModel.js";

export async function validarInscripcion(datos) {
  // Aseguramos que los IDs sean números
  const estudiante_id = Number(datos.estudiante_id);
  const seccion_id = Number(datos.seccion_id);

  // 1. Validación de campos básicos
  if (!estudiante_id || !seccion_id) {
    return { 
      status: "error", 
      message: "Información incompleta. Debe seleccionar estudiante y sección." 
    };
  }

  try {
    // 2. Obtenemos la información de la sección para saber a qué materia pertenece
    // Esto es más seguro que confiar en el materia_id que envíe el cliente
    const seccion = await InscripcionModel.obtenerSeccionPorId(seccion_id);

    if (!seccion) {
      return { status: "error", message: "La sección seleccionada no existe." };
    }

    // 3. Comprobar cupos disponibles
    if (seccion.cupos <= 0) {
      return { status: "error", message: "No hay cupos disponibles en esta sección." };
    }

    // 4. Comprobar duplicados usando el materia_id que encontramos en la DB
    const yaInscrito = await InscripcionModel.verificarDuplicado(estudiante_id, seccion.materia_id);

    if (yaInscrito) {
      return { 
        status: "error", 
        message: "El estudiante ya posee una inscripción en esta materia." 
      };
    }

    // Si pasa todas las pruebas
    return { status: "ok" };

  } catch (error) {
    console.error("Error en service validarInscripcion:", error);
    return { 
      status: "error", 
      message: "Error de integridad al validar. Intente de nuevo." 
    };
  }
}
*/
