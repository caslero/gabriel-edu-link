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
      res.render('admin/gestionar-materias', { title: 'Error', user: req.session.user, materias: [], semestres: [], secciones: [] });
    }
  }

  // API: Crear Sección
  static async apiCrearSeccion(req, res) {
    try {
      const { materia_id, seccion_nombre } = req.body;
      if (!materia_id || !seccion_nombre) return respuestaAlFront(res, "error", "Datos incompletos", {}, 400);

      await MateriaModel.crearSeccion(seccion_nombre, materia_id);
      return respuestaAlFront(res, "ok", "Sección creada", { redirect: "/admin/gestionar-materias" });
    } catch (error) {
      return respuestaAlFront(res, "error", "Error al crear", {}, 500);
    }
  }

  // API: Eliminar Materia
  static async apiEliminarMateria(req, res) {
    try {
      await MateriaModel.eliminarMateria(req.params.id);
      return respuestaAlFront(res, "ok", "Materia eliminada", { redirect: "/admin/gestionar-materias" });
    } catch (error) {
      return respuestaAlFront(res, "error", "No se pudo eliminar", {}, 500);
    }
  }
}