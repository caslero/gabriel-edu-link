import { MateriaModel } from "../models/MateriaModel.js";
import { respuestaAlFront } from "../utils/respuestaAlFront.js";

export default class MateriaController {
  
  // Renderiza la vista (Carga inicial)
  static async getGestionPage(req, res) {
    try {
      const [materias, semestres, secciones] = await Promise.all([
        MateriaModel.obtenerTodo(),
        MateriaModel.obtenerSemestres(),
        MateriaModel.obtenerSeccionesConDetalle()
      ]);

      res.render('admin/gestionar-materias', { 
        title: 'Gestión de Materias', 
        user: req.session.user, 
        materias, semestres, secciones 
      });
    } catch (error) {
      console.error("Error al cargar página:", error);
      res.render('admin/gestionar-materias', { 
        title: 'Error', 
        user: req.session.user, 
        materias: [], semestres: [], secciones: [] 
      });
    }
  }

  // API: Crear Sección
  static async apiCrearSeccion(req, res) {
    try {
      const { materia_id, seccion_nombre } = req.body;
      // IMPORTANTE: Obtenemos el ID del usuario logueado de la sesión
      const usuario_id = req.session.user?.id;

      if (!materia_id || !seccion_nombre) {
        return respuestaAlFront(res, "error", "Datos incompletos", {}, 400);
      }

      if (!usuario_id) {
        return respuestaAlFront(res, "error", "Sesión no válida o expirada", {}, 401);
      }

      // Pasamos los 3 parámetros necesarios según tu nueva tabla
      await MateriaModel.crearSeccion(seccion_nombre, materia_id, usuario_id);
      
      return respuestaAlFront(res, "ok", "Sección registrada correctamente");
    } catch (error) {
      console.error("Error en apiCrearSeccion:", error);
      return respuestaAlFront(res, "error", "Error interno al crear sección", {}, 500);
    }
  }

  // API: Eliminar Sección (Adaptado a PATCH según tu JS)
  static async apiEliminarSeccion(req, res) {
    try {
      const { id } = req.body;
      const usuario_id = req.session.user?.id;

      if (!id) return respuestaAlFront(res, "error", "ID no proporcionado", {}, 400);

      // Opcional: El modelo puede verificar si el usuario tiene permiso (si es el creador)
      await MateriaModel.eliminarSeccion(id, usuario_id);
      
      return respuestaAlFront(res, "ok", "Sección eliminada");
    } catch (error) {
      console.error("Error en apiEliminarSeccion:", error);
      return respuestaAlFront(res, "error", "No se pudo eliminar el registro", {}, 500);
    }
  }
}