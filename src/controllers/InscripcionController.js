import { InscripcionModel } from "../models/InscripcionModel.js";
import { respuestaAlFront } from "../utils/respuestaAlFront.js";
import { validarInscripcion } from "../services/inscripciones/validarInscripcion.js";
import { validarGestion } from "../services/inscripciones/validarGestion.js";

export default class InscripcionController {
  
  // 1. Buscar estudiante por cédula y letra (V/E)
static async buscarEstudiante(req, res) {
    try {
        const { cedula, pais } = req.body; // Ahora es POST
        const paisBit = (pais === 'V') ? 1 : 0;

       

        const cedulaLimpia = cedula.replace(/[^0-9]/g, ''); 
        const estudiante = await InscripcionModel.buscarEstudiantePorCedula(cedulaLimpia, paisBit);
        
       

        if (estudiante) {
            return res.json({ status: "ok", estudiante });
        } else {
            // Si llegamos aquí, la query SQL devolvió 'undefined'
            return res.json({ status: "error", message: "Estudiante no registrado" });
        }
    } catch (error) {
        console.error("ERROR CRÍTICO:", error);
        return res.status(500).json({ status: "error", message: "Error interno" });
    }
}
  // 2. Crear nueva inscripción (Manual o por solicitud)
  static async crearInscripcion(req, res) {
    try {
      console.log(" Datos recibidos para inscripción:", req.body);

      // Validación de reglas de negocio (Cupos, duplicados, etc.)
      const validacion = await validarInscripcion(req.body);
      if (validacion.status === "error") {
        return respuestaAlFront(res, "error", validacion.message, {}, 400);
      }

      // Preparar datos para el modelo
      const datosInscripcion = {
        estudiante_id: req.body.estudiante_id,
        seccion_id: req.body.seccion_id,
        // Auditoría: Si no hay sesión, usamos el ID del estudiante o 1 por defecto
        usuario_id: req.session?.usuarioId || req.body.estudiante_id || 1 
      };

      const resultado = await InscripcionModel.crearInscripcion(datosInscripcion);

      return respuestaAlFront(res, "ok", "¡Inscripción procesada exitosamente!", resultado);
    } catch (error) {
      console.error(" Error en crearInscripcion:", error);
      const msg = error.message === "No hay cupos disponibles" ? error.message : "No se pudo completar la inscripción";
      return respuestaAlFront(res, "error", msg, {}, 500);
    }
  }

  // 3. Listar inscripciones confirmadas para la tabla gris
  static async listarConfirmadas(req, res) {
    try {
      const inscripciones = await InscripcionModel.obtenerConfirmadas();
      return respuestaAlFront(res, "ok", "Registros obtenidos", { inscripciones });
    } catch (error) {
      console.error(" Error en listarConfirmadas:", error);
      return respuestaAlFront(res, "error", "No se pudieron cargar los registros", {}, 500);
    }
  }

  // 4. Aprobar o Rechazar solicitudes (Desde los botones del modal)
  static async gestionarSolicitud(req, res) {
    try {
      const { id } = req.params;
      const { estado, comentario } = req.body;
      console.log(` Gestionando solicitud ${id} -> Nuevo estado: ${estado}`);

      const validacion = await validarGestion({ estado, comentario });
      if (validacion.status === "error") {
        return respuestaAlFront(res, "error", validacion.message, {}, 400);
      }

      const usuario_id = req.session?.usuarioId || 1; 
      const exito = await InscripcionModel.actualizarEstado(id, estado, comentario || 'Procesado por administración', usuario_id);

      if (!exito) {
        return respuestaAlFront(res, "error", "La inscripción no existe", {}, 404);
      }

      return respuestaAlFront(res, "ok", `La solicitud ha sido ${estado.toLowerCase()}`, {});
    } catch (error) {
      console.error(" Error en gestionarSolicitud:", error);
      return respuestaAlFront(res, "error", "Error al procesar el cambio de estado", {}, 500);
    }
  }


    static async listarSemestres(req, res) {
      try {
        const semestres = await InscripcionModel.obtenerSemestresUnicos();
        
        // IMPORTANTE: Envía el objeto dentro de 'datos' para que coincida con tu frontend
        return respuestaAlFront(res, "ok", "Semestres cargados", { semestres }, 200);
      } catch (error) {
        console.error("Error en listarSemestres:", error);
        // Forzamos un JSON de error para que el frontend no reciba HTML
        return res.status(500).json({ status: "error", message: "Error interno del servidor" });
      }
    }

   static async listarMaterias(req, res) {
        try {
            const { semestre } = req.query; // Captura de la Query String (?semestre=X)

            if (!semestre) {
                return respuestaAlFront(res, "error", "Falta el semestre", {}, 400);
            }

            const materias = await InscripcionModel.obtenerMateriasPorSemestre(semestre);
            
        
            return respuestaAlFront(res, "ok", "Materias obtenidas", { materias }, 200);
        } catch (error) {
            console.error("Error en listarMaterias:", error);
            return respuestaAlFront(res, "error", "Error interno", {}, 500);
        }
    }

      
      static async listarSecciones(req, res) {
        try {
            const { nombreMateria } = req.query;

            if (!nombreMateria) {
                return res.status(400).json({ status: "error", message: "Falta el nombre de la materia" });
            }

            // Aquí llamamos al MODELO, no a una función interna del controlador
            const secciones = await InscripcionModel.obtenerSeccionesPorNombreMateria(nombreMateria);
            
            return res.json({ status: "ok", secciones });
        } catch (error) {
            
            console.error(" ERROR REAL DETECTADO:", error);

            return res.status(500).json({ status: "error", message: "Error interno" });
        }
    }
}

