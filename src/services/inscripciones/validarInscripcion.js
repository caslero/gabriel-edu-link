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