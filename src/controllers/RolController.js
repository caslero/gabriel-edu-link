import { RolModel } from "../models/RolModel.js";
import validarCrearRol from "../services/roles/validarCrearRol.js";
import validarObtenerTodosRoles from "../services/roles/validarObtenerTodosRoles.js";
import { respuestaAlFront } from "../utils/respuestaAlFront.js";

export default class RolController {
  static async crearRol(req, res) {
    try {
      const { nombre } = req.body;

      const validaciones = await validarCrearRol(nombre, req);

      if (validaciones.status === "error") {
        return respuestaAlFront(
          res,
          validaciones.status,
          validaciones.message,
          {},
          validaciones.codigo ? validaciones.codigo : 400,
        );
      }

      const creandoRol = await RolModel.crearRol({
        nombre: validaciones.nombre,
      });

      if (!creandoRol) {
        return respuestaAlFront(res, "error", "Error al crear rol", {}, 400);
      }

      return respuestaAlFront(
        res,
        "ok",
        "Rol creado con exito",
        {
          roles: creandoRol,
        },
        201,
      );
    } catch (error) {
      console.error("Error interno crear rol:", error);

      return respuestaAlFront(res, "error", "Error interno crear rol", {}, 500);
    }
  }

  static async todosRoles(req, res) {
    try {
      const validaciones = await validarObtenerTodosRoles(req);

      if (validaciones.status === "error") {
        return respuestaAlFront(
          res,
          validaciones.status,
          validaciones.message,
          {},
          validaciones.codigo ? validaciones.codigo : 400,
        );
      }

      const todosRoles = await RolModel.obtenerTodosLosRoles();

      if (!todosRoles) {
        return respuestaAlFront(
          res,
          "error",
          "Error al obtener todos los roles",
          {},
          400,
        );
      }

      return respuestaAlFront(
        res,
        "ok",
        "Todos los roles obtenidos",
        {
          roles: todosRoles,
        },
        200,
      );
    } catch (error) {
      console.log("Error interno todos los roles:", error);

      return respuestaAlFront(
        res,
        "error",
        "Error interno todos los roles",
        {},
        500,
      );
    }
  }
}
