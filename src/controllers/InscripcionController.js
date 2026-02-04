import { respuestaAlFront } from "../utils/respuestaAlFront.js";

import validarCrearInscripcion from "../services/inscripciones/validarCrearInscripcion.js";
import { validarGestion } from "../services/inscripciones/validarGestion.js";
import { validarSolicitud } from "../services/inscripciones/validarSolicitud.js";

import { InscripcionModel } from "../models/InscripcionModel.js";
import obtenerDatosUsuarioToken from "../libs/obtenerDatosUsuarioToken.js";
import validarGestionarSolicitudInscripcion from "../services/inscripciones/validarGestionarSolicitudInscripcion.js";

export default class InscripcionController {
  // 2. Crear nueva inscripción (Manual o por solicitud)
  static async crearInscripcion(req, res) {
    try {
      const validaciones = await validarCrearInscripcion(req);

      if (validaciones.status === "error") {
        return respuestaAlFront(
          res,
          validaciones.status,
          validaciones.message,
          {},
          validaciones.codigo ? validaciones.codigo : 400,
        );
      }

      const resultado = await InscripcionModel.crearInscripcion(
        validaciones.estudiante_id,
        validaciones.seccion_id,
        validaciones.usuario_id,
      );

      return respuestaAlFront(
        res,
        "ok",
        "Inscripción creada con exito",
        { resultado: resultado },
        201,
      );
    } catch (error) {
      console.log("Error interno crear inscripción:", error);

      return respuestaAlFront(
        res,
        "error",
        "Error interno al crear inscripción",
        {},
        500,
      );
    }
  }

  // 3. Listar inscripciones confirmadas para la tabla gris
  static async listarConfirmadas(req, res) {
    try {
      const validaciones = await obtenerDatosUsuarioToken(req);

      if (validaciones.status === "error") {
        return respuestaAlFront(
          res,
          validaciones.status,
          validaciones.message,
          {},
          400,
        );
      }

      const inscripciones = await InscripcionModel.obtenerConfirmadas();

      if (!inscripciones) {
        return respuestaAlFront(
          res,
          "error",
          "Error no hay inscripciones confirmadas",
          {
            inscripciones: [],
          },
          200,
        );
      }

      return respuestaAlFront(
        res,
        "ok",
        "Exito obtener inscripciones confirmadas",
        {
          inscripciones: inscripciones,
        },
        200,
      );
    } catch (error) {
      console.log("Error interno obtener inscripciones confirmadas:", error);

      return respuestaAlFront(
        res,
        "error",
        "Error interno obtener inscripciones confirmadas",
        {},
        500,
      );
    }
  }

  /** Voy por aqui acomodando este metodo del controlador y creadondo las
   validaciones Caslero */
  // 4. Aprobar o Rechazar solicitudes (Desde los botones del modal)
  static async gestionarSolicitud(req, res) {
    try {
      const validaciones = await validarGestionarSolicitudInscripcion(req);

      if (validaciones.status === "error") {
        return respuestaAlFront(
          res,
          validaciones.status,
          validaciones.message,
          {},
          400,
        );
      }

      console.log(` Gestionando solicitud ${id} -> Nuevo estado: ${estado}`);

      const validacion = await validarGestion({ estado, comentario });
      if (validacion.status === "error") {
        return respuestaAlFront(res, "error", validacion.message, {}, 400);
      }

      const usuario_id = req.session?.usuarioId || 1;
      const exito = await InscripcionModel.actualizarEstado(
        id,
        estado,
        comentario || "Procesado por administración",
        usuario_id,
      );

      if (!exito) {
        return respuestaAlFront(
          res,
          "error",
          "La inscripción no existe",
          {},
          404,
        );
      }

      return respuestaAlFront(
        res,
        "ok",
        `La solicitud ha sido ${estado.toLowerCase()}`,
        {},
      );
    } catch (error) {
      console.error(" Error en gestionarSolicitud:", error);
      return respuestaAlFront(
        res,
        "error",
        "Error al procesar el cambio de estado",
        {},
        500,
      );
    }
  }

  static async listarSemestres(req, res) {
    try {
      const semestres = await InscripcionModel.obtenerSemestresUnicos();

      // IMPORTANTE: Envía el objeto dentro de 'datos' para que coincida con tu frontend
      return respuestaAlFront(
        res,
        "ok",
        "Semestres cargados",
        { semestres },
        200,
      );
    } catch (error) {
      console.error("Error en listarSemestres:", error);
      // Forzamos un JSON de error para que el frontend no reciba HTML
      return res
        .status(500)
        .json({ status: "error", message: "Error interno del servidor" });
    }
  }

  static async listarMaterias(req, res) {
    try {
      const { semestre } = req.query; // Captura de la Query String (?semestre=X)

      if (!semestre) {
        return respuestaAlFront(res, "error", "Falta el semestre", {}, 400);
      }

      const materias =
        await InscripcionModel.obtenerMateriasPorSemestre(semestre);

      return respuestaAlFront(
        res,
        "ok",
        "Materias obtenidas",
        { materias },
        200,
      );
    } catch (error) {
      console.error("Error en listarMaterias:", error);
      return respuestaAlFront(res, "error", "Error interno", {}, 500);
    }
  }

  static async listarSecciones(req, res) {
    try {
      const { nombreMateria } = req.query;

      if (!nombreMateria) {
        return res
          .status(400)
          .json({ status: "error", message: "Falta el nombre de la materia" });
      }

      // Aquí llamamos al MODELO, no a una función interna del controlador
      const secciones =
        await InscripcionModel.obtenerSeccionesPorNombreMateria(nombreMateria);

      return res.json({ status: "ok", secciones });
    } catch (error) {
      console.error(" ERROR REAL DETECTADO:", error);

      return res
        .status(500)
        .json({ status: "error", message: "Error interno" });
    }
  }

  // 5. Solicitar inscripción (Vista Estudiante)
  static async solicitarInscripcion(req, res) {
    try {
      // Extraemos solo lo necesario: quién se inscribe y en qué sección
      const { usuario_id, seccion_id } = req.body;

      console.log(
        " Recibiendo solicitud para usuario:",
        usuario_id,
        "Sección:",
        seccion_id,
      );

      // 1. Validar (Asegúrate de que validarSolicitud ya no pida estudiante_id)
      const validacion = await validarSolicitud({ usuario_id, seccion_id });

      if (validacion.status === "error") {
        console.warn(" Validación fallida:", validacion.message);
        return res.status(400).json(validacion);
      }

      // 2. Llamada al modelo
      const resultado = await InscripcionModel.crearSolicitud({
        usuario_id,
        seccion_id,
        estado: "Pendiente",
      });

      // 3. Respuesta exitosa
      return res.status(200).json({
        status: "ok",
        message: "Solicitud enviada con éxito.",
        datos: resultado,
      });
    } catch (error) {
      // Este log en tu terminal de VS Code te dirá si la DB rechazó el INSERT
      console.error(" ERROR EN EL SERVIDOR:", error.message);

      return res.status(500).json({
        status: "error",
        message: "Error al procesar la inscripción: " + error.message,
      });
    }
  }
}

/** 
import { InscripcionModel } from "../models/InscripcionModel.js";
import { respuestaAlFront } from "../utils/respuestaAlFront.js";
import { validarInscripcion } from "../services/inscripciones/validarInscripcion.js";
import { validarGestion } from "../services/inscripciones/validarGestion.js";
import { validarSolicitud } from "../services/inscripciones/validarSolicitud.js";

export default class InscripcionController {
  // 1. Buscar estudiante por cédula y letra (V/E)
  static async buscarEstudiante(req, res) {
    try {
      const { cedula, pais } = req.body; // Ahora es POST
      const paisBit = pais === "V" ? 1 : 0;

      const cedulaLimpia = cedula.replace(/[^0-9]/g, "");
      const estudiante = await InscripcionModel.buscarEstudiantePorCedula(
        cedulaLimpia,
        paisBit,
      );

      if (estudiante) {
        return res.json({ status: "ok", estudiante });
      } else {
        // Si llegamos aquí, la query SQL devolvió 'undefined'
        return res.json({
          status: "error",
          message: "Estudiante no registrado",
        });
      }
    } catch (error) {
      console.error("ERROR CRÍTICO:", error);
      return res
        .status(500)
        .json({ status: "error", message: "Error interno" });
    }
  }
  // 2. Crear nueva inscripción (Manual o por solicitud)
  static async crearInscripcion(req, res) {
    try {
      // 1. Validar reglas de negocio
      const validacion = await validarInscripcion(req.body);
      if (validacion.status === "error") {
        return respuestaAlFront(res, "error", validacion.message, {}, 400);
      }

      // 2. Preparar datos (usuario_id 1 por defecto si no hay sesión aún)
      const datosFinales = {
        estudiante_id: req.body.estudiante_id,
        seccion_id: req.body.seccion_id,
        usuario_id: req.session?.usuarioId || 1,
      };

      // 3. Ejecutar en DB
      const resultado = await InscripcionModel.crearInscripcion(datosFinales);

      return respuestaAlFront(
        res,
        "ok",
        "¡Inscripción exitosa y cupo actualizado!",
        resultado,
      );
    } catch (error) {
      console.error("Error final en inscripción:", error);
      return respuestaAlFront(res, "error", error.message, {}, 500);
    }
  }

  // 3. Listar inscripciones confirmadas para la tabla gris
  static async listarConfirmadas(req, res) {
    try {
      const inscripciones = await InscripcionModel.obtenerConfirmadas();
      return respuestaAlFront(res, "ok", "Registros obtenidos", {
        inscripciones,
      });
    } catch (error) {
      console.error(" Error en listarConfirmadas:", error);
      return respuestaAlFront(
        res,
        "error",
        "No se pudieron cargar los registros",
        {},
        500,
      );
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
      const exito = await InscripcionModel.actualizarEstado(
        id,
        estado,
        comentario || "Procesado por administración",
        usuario_id,
      );

      if (!exito) {
        return respuestaAlFront(
          res,
          "error",
          "La inscripción no existe",
          {},
          404,
        );
      }

      return respuestaAlFront(
        res,
        "ok",
        `La solicitud ha sido ${estado.toLowerCase()}`,
        {},
      );
    } catch (error) {
      console.error(" Error en gestionarSolicitud:", error);
      return respuestaAlFront(
        res,
        "error",
        "Error al procesar el cambio de estado",
        {},
        500,
      );
    }
  }

  static async listarSemestres(req, res) {
    try {
      const semestres = await InscripcionModel.obtenerSemestresUnicos();

      // IMPORTANTE: Envía el objeto dentro de 'datos' para que coincida con tu frontend
      return respuestaAlFront(
        res,
        "ok",
        "Semestres cargados",
        { semestres },
        200,
      );
    } catch (error) {
      console.error("Error en listarSemestres:", error);
      // Forzamos un JSON de error para que el frontend no reciba HTML
      return res
        .status(500)
        .json({ status: "error", message: "Error interno del servidor" });
    }
  }

  static async listarMaterias(req, res) {
    try {
      const { semestre } = req.query; // Captura de la Query String (?semestre=X)

      if (!semestre) {
        return respuestaAlFront(res, "error", "Falta el semestre", {}, 400);
      }

      const materias =
        await InscripcionModel.obtenerMateriasPorSemestre(semestre);

      return respuestaAlFront(
        res,
        "ok",
        "Materias obtenidas",
        { materias },
        200,
      );
    } catch (error) {
      console.error("Error en listarMaterias:", error);
      return respuestaAlFront(res, "error", "Error interno", {}, 500);
    }
  }

  static async listarSecciones(req, res) {
    try {
      const { nombreMateria } = req.query;

      if (!nombreMateria) {
        return res
          .status(400)
          .json({ status: "error", message: "Falta el nombre de la materia" });
      }

      // Aquí llamamos al MODELO, no a una función interna del controlador
      const secciones =
        await InscripcionModel.obtenerSeccionesPorNombreMateria(nombreMateria);

      return res.json({ status: "ok", secciones });
    } catch (error) {
      console.error(" ERROR REAL DETECTADO:", error);

      return res
        .status(500)
        .json({ status: "error", message: "Error interno" });
    }
  }

  // 5. Solicitar inscripción (Vista Estudiante)
  static async solicitarInscripcion(req, res) {
    try {
      // Extraemos solo lo necesario: quién se inscribe y en qué sección
      const { usuario_id, seccion_id } = req.body;

      console.log(
        " Recibiendo solicitud para usuario:",
        usuario_id,
        "Sección:",
        seccion_id,
      );

      // 1. Validar (Asegúrate de que validarSolicitud ya no pida estudiante_id)
      const validacion = await validarSolicitud({ usuario_id, seccion_id });

      if (validacion.status === "error") {
        console.warn(" Validación fallida:", validacion.message);
        return res.status(400).json(validacion);
      }

      // 2. Llamada al modelo
      const resultado = await InscripcionModel.crearSolicitud({
        usuario_id,
        seccion_id,
        estado: "Pendiente",
      });

      // 3. Respuesta exitosa
      return res.status(200).json({
        status: "ok",
        message: "Solicitud enviada con éxito.",
        datos: resultado,
      });
    } catch (error) {
      // Este log en tu terminal de VS Code te dirá si la DB rechazó el INSERT
      console.error(" ERROR EN EL SERVIDOR:", error.message);

      return res.status(500).json({
        status: "error",
        message: "Error al procesar la inscripción: " + error.message,
      });
    }
  }
}
*/
