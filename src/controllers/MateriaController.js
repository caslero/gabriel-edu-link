import { MateriaModel } from "../models/MateriaModel.js";
import validarCrearMateria from "../services/materias/validarCrearMateria.js";
import validarObtenerTodasMaterias from "../services/materias/validarObtenerTodasMaterias.js";
import { respuestaAlFront } from "../utils/respuestaAlFront.js";

export default class MateriaController {
  static async crearMateria(req, res) {
    try {
      const validaciones = await validarCrearMateria(req);

      if (validaciones.status === "error") {
        return respuestaAlFront(
          res,
          validaciones.status,
          validaciones.message,
          {},
          validaciones.codigo ? validaciones.codigo : 400,
        );
      }

      const creandoMateria = await MateriaModel.crearMateria({
        nombre: validaciones.nombre,
        semestre: validaciones.semestre,
        usuario_id: validaciones.usuarioId,
      });

      if (!creandoMateria) {
        return respuestaAlFront(
          res,
          "error",
          "Error al crear materia",
          {},
          400,
        );
      }

      return respuestaAlFront(
        res,
        "ok",
        "Materia creada con exito",
        {
          materias: creandoMateria,
        },
        201,
      );
    } catch (error) {
      console.error("Error interno crear materia:", error);

      return respuestaAlFront(
        res,
        "error",
        "Error interno crear materia",
        {},
        500,
      );
    }
  }

  static async todasMaterias(req, res) {
    try {
      const validaciones = await validarObtenerTodasMaterias(req);

      if (validaciones.status === "error") {
        return respuestaAlFront(
          res,
          validaciones.status,
          validaciones.message,
          {},
          validaciones.codigo ? validaciones.codigo : 400,
        );
      }

      const todasLasMaterias = await MateriaModel.obtenerTodasLasMaterias();

      if (!todasLasMaterias) {
        return respuestaAlFront(
          res,
          "error",
          "Error al obtener todas las materias",
          {},
          400,
        );
      }

      return respuestaAlFront(
        res,
        "ok",
        "Todas las materias obtenidas",
        {
          materias: todasLasMaterias,
        },
        200,
      );
    } catch (error) {
      console.log("Error interno todas las materias:", error);

      return respuestaAlFront(
        res,
        "error",
        "Error interno todas las materias",
        {},
        500,
      );
    }
  }
}
