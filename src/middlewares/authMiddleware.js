import obtenerDatosUsuarioToken from "../libs/obtenerDatosUsuarioToken.js";

export default class AuthMiddleware {
  // Middleware base que obtiene y valida el token UNA VEZ
  static async authenticado(req, res, next) {
    try {
      const validaciones = await obtenerDatosUsuarioToken(req);

      if (validaciones.status === "error") {
        return res.redirect("/no-autorizado");
      }

      // Guardar las validaciones en la request para reutilizar
      req.authData = validaciones;

      next();
    } catch (error) {
      console.log("Error en autenticación:", error);
      return res.redirect("/no-autorizado");
    }
  }

  // Solo ADMIN (rol 1) - USA los datos ya obtenidos por authenticado
  static async soloAdmin(req, res, next) {
    try {
      // Usar los datos ya validados por authenticado
      const validaciones = req.authData;

      if (!validaciones) {
        return res.redirect("/no-autorizado");
      }

      if (validaciones.rolId !== 1) {
        return res.redirect("/no-autorizado");
      }

      next();
    } catch (error) {
      console.log("Error en autorización admin:", error);
      return res.redirect("/no-autorizado");
    }
  }

  // Solo PROFESOR (rol 2) - USA los datos ya obtenidos por authenticado
  static async soloProfesor(req, res, next) {
    try {
      const validaciones = req.authData;

      if (!validaciones) {
        return res.redirect("/no-autorizado");
      }

      if (validaciones.rolId !== 2) {
        return res.redirect("/no-autorizado");
      }

      next();
    } catch (error) {
      console.log("Error en autorización profesor:", error);
      return res.redirect("/no-autorizado");
    }
  }

  // Solo ALUMNO (rol 3) - USA los datos ya obtenidos por authenticado
  static async soloAlumno(req, res, next) {
    try {
      const validaciones = req.authData;

      if (!validaciones) {
        return res.redirect("/no-autorizado");
      }

      if (validaciones.rolId !== 3) {
        return res.redirect("/no-autorizado");
      }

      next();
    } catch (error) {
      console.log("Error en autorización alumno:", error);
      return res.redirect("/no-autorizado");
    }
  }
}

/** 
import obtenerDatosUsuarioToken from "../libs/obtenerDatosUsuarioToken.js";
import { respuestaAlFront } from "../utils/respuestaAlFront.js";

export default class AuthMiddleware {
  // middlewares/soloAdmin.js
  static async authenticado(req, res, next) {
    try {
      const validaciones = await obtenerDatosUsuarioToken(req);

      if (validaciones.status === "error") {
        return res.redirect("/no-autorizado");
      }

      next();
    } catch (error) {
      console.log("Error en autenticación:", error);

      return respuestaAlFront(
        res,
        "error",
        "Error interno en autenticación",
        {},
        500,
      );
    }
  }

  // middlewares/soloAdmin.js
  static async soloAdmin(req, res, next) {
    try {
      const validaciones = await obtenerDatosUsuarioToken(req);

      if (validaciones.status === "error") {
        return respuestaAlFront(
          res,
          validaciones.status,
          validaciones.message,
          {},
          validaciones.codigo ? validaciones.codigo : 401,
        );
      }

      if (validaciones.rolId !== 1) {
        return res.redirect("/no-autorizado");
      }

      next();
    } catch (error) {
      console.log("Error en autorización admin (rol 1):", error);

      return respuestaAlFront(
        res,
        "error",
        "Error interno en autorización (rol 1)",
        {},
        500,
      );
    }
  }

  // middlewares/soloProfesor.js
  static async soloProfesor(req, res, next) {
    try {
      const validaciones = await obtenerDatosUsuarioToken(req);

      if (validaciones.status === "error") {
        return respuestaAlFront(
          res,
          validaciones.status,
          validaciones.message,
          {},
          validaciones.codigo ? validaciones.codigo : 401,
        );
      }

      if (validaciones.rolId !== 2) {
        return res.redirect("/no-autorizado");
      }

      next();
    } catch (error) {
      console.log("Error en autorización profesor (rol 2):", error);

      return respuestaAlFront(
        res,
        "error",
        "Error interno en autorización (rol 2)",
        {},
        500,
      );
    }
  }

  // middlewares/soloAlumno.js
  static async soloAlumno(req, res, next) {
    try {
      const validaciones = await obtenerDatosUsuarioToken(req);

      if (validaciones.status === "error") {
        return respuestaAlFront(
          res,
          validaciones.status,
          validaciones.message,
          {},
          validaciones.codigo ? validaciones.codigo : 401,
        );
      }

      if (validaciones.rolId !== 3) {
        return res.redirect("/no-autorizado");
      }

      next();
    } catch (error) {
      console.log("Error en autorización alumno (rol 3):", error);

      return respuestaAlFront(
        res,
        "error",
        "Error interno en autorización (rol 3)",
        {},
        500,
      );
    }
  }
}
*/
