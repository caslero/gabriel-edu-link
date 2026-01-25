import { SeccionModel } from "../models/SeccionModel.js";
import validarCrearSeccion from "../services/secciones/validarCrearSeccion.js";
import validarObtenerTodasSecciones from "../services/secciones/validarObtenerTodasSecciones.js";
import { respuestaAlFront } from "../utils/respuestaAlFront.js";

export default class SeccionController {
  static async crearSeccion(req, res) {
    try {
      const validaciones = await validarCrearSeccion(req);

      if (validaciones.status === "error") {
        return respuestaAlFront(
          res,
          validaciones.status,
          validaciones.message,
          {},
          validaciones.codigo ? validaciones.codigo : 400,
        );
      }

      const creandoSeccion = await SeccionModel.crearSeccion({
        materia_id: validaciones.materiaId,
        seccion_nombre: validaciones.nombre,
        cupos: validaciones.cupos,
        usuario_id: validaciones.usuarioId,
      });

      if (!creandoSeccion) {
        return respuestaAlFront(
          res,
          "error",
          "Error al crear seccion",
          {},
          400,
        );
      }

      return respuestaAlFront(
        res,
        "ok",
        "Sección creada con exito",
        {
          secciones: creandoSeccion,
        },
        201,
      );
    } catch (error) {
      console.error("Error interno crear sección:", error);

      return respuestaAlFront(
        res,
        "error",
        "Error interno crear sección",
        {},
        500,
      );
    }
  }

  static async todasSecciones(req, res) {
    try {
      const validaciones = await validarObtenerTodasSecciones(req);

      if (validaciones.status === "error") {
        return respuestaAlFront(
          res,
          validaciones.status,
          validaciones.message,
          {},
          validaciones.codigo ? validaciones.codigo : 400,
        );
      }

      const todasLasSecciones = await SeccionModel.obtenerTodasLasSecciones();

      if (!todasLasSecciones) {
        return respuestaAlFront(
          res,
          "error",
          "Error al obtener todas las secciones",
          {},
          400,
        );
      }

      return respuestaAlFront(
        res,
        "ok",
        "Todas las secciones obtenidas",
        {
          secciones: todasLasSecciones,
        },
        200,
      );
    } catch (error) {
      console.log("Error interno todas las secciones:", error);

      return respuestaAlFront(
        res,
        "error",
        "Error interno todas las secciones",
        {},
        500,
      );
    }
  }
}
