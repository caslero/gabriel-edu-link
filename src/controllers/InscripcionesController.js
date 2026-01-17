import { InscripcionModel } from "../models/InscripcionModel.js";
import { respuestaAlFront } from "../utils/respuestaAlFront.js";

export default class InscripcionesController {
  
  // --- MÉTODOS DE CONSULTA (GET) ---

  static async getGestionInscripciones(req, res) {
    try {
      const data = await InscripcionModel.obtenerTodoGestion();
      return respuestaAlFront(res, "ok", "Datos de gestión cargados", data, 200);
    } catch (error) {
      console.error("Error en getGestionInscripciones:", error);
      return respuestaAlFront(res, "error", "Error interno al cargar gestión", {}, 500);
    }
  }

  static async buscarEstudiante(req, res) {
    try {
      const { cedula } = req.params;
      const estudiante = await InscripcionModel.buscarEstudiantePorCedula(cedula);
      
      if (!estudiante) {
        return respuestaAlFront(res, "error", "Estudiante no encontrado", {}, 404);
      }
      return respuestaAlFront(res, "ok", "Estudiante encontrado", { estudiante }, 200);
    } catch (error) {
      return respuestaAlFront(res, "error", "Error en la búsqueda", {}, 500);
    }
  }

  // --- MÉTODO UNIFICADO ---

  /**
   * Ruta: POST /api/inscripciones/crear-inscripcion
   * Maneja tanto inscripciones directas (Admin) como solicitudes (Estudiante)
   */
  static async crearInscripcion(req, res) {
    try {
      const { estudiante_id, materia_id, seccion_id } = req.body;

      // Prioridad 1: ID enviado en el body (Flujo Admin)
      // Prioridad 2: ID del usuario autenticado (Flujo Estudiante)
      const idUsuarioFinal = estudiante_id || (req.user ? req.user.id : null);

      if (!idUsuarioFinal || !materia_id || !seccion_id) {
        return respuestaAlFront(res, "error", "Faltan datos obligatorios para procesar la inscripción", {}, 400);
      }

      // Decidimos el flujo basado en si el ID vino del body (Admin seleccionando estudiante)
      if (estudiante_id) {
        // FLUJO ADMIN: Inscripción Directa
        await InscripcionModel.crearInscripcionManual({
          estudiante_id: idUsuarioFinal,
          materia_id,
          seccion_id
        });

        return respuestaAlFront(res, "ok", "Inscripción registrada con éxito por el administrador", { 
          redirect: "/admin/gestionar-inscripciones" 
        }, 201);

      } else {
        // FLUJO ESTUDIANTE: Crear Solicitud Pendiente
        await InscripcionModel.crearSolicitudEstudiante({
          estudiante_id: idUsuarioFinal,
          materia_id,
          seccion_id
        });

        return respuestaAlFront(res, "ok", "Tu solicitud de inscripción ha sido enviada", { 
          redirect: "/estudiante/inscripcion" 
        }, 201);
      }
    } catch (error) {
      console.error("Error en crearInscripcion:", error);
      return respuestaAlFront(res, "error", "No se pudo procesar la operación en la base de datos", {}, 500);
    }
  }


  static async actualizarEstadoSolicitud(req, res) {
    try {
      const { id } = req.params;
      const { estado, comentario } = req.body;

      const actualizado = await InscripcionModel.actualizarEstado(id, estado, comentario);

      if (!actualizado) {
        return respuestaAlFront(res, "error", "No se pudo actualizar la solicitud", {}, 400);
      }

      return respuestaAlFront(res, "ok", `Solicitud ${estado} con éxito`, { 
        redirect: "/admin/gestionar-inscripciones" 
      }, 200);
    } catch (error) {
      return respuestaAlFront(res, "error", "Error interno al actualizar estado", {}, 500);
    }
  }
}