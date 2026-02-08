import EncuestasModel from "../models/EncuestasModel.js";
import validarObtenerTodasEncuestasEstudiantes from "../services/encuestas/validarObtenerTodasEncuestasEstudiantes.js";
import { respuestaAlFront } from "../utils/respuestaAlFront.js";

class EncuestasController {
  // ==========================================
  // VISTAS (RENDER)
  // ==========================================

  // Vista para el Admin
  static async vistaGestionar(req, res) {
    try {
      const semestres = await EncuestasModel.obtenerSemestres();
      const materias = await EncuestasModel.obtenerMaterias();
      res.render("admin/gestionar-encuestas", {
        semestres,
        materias,
        title: "Gestionar Encuestas",
      });
    } catch (error) {
      res.status(500).send("Error al cargar la vista de administración");
    }
  }

  // ==========================================
  // LÓGICA DE ESTUDIANTE (VOTACIÓN)
  // ==========================================

  static async votar(req, res) {
    try {
      const { encuestaId } = req.params;
      let { materias } = req.body;
      const estudianteId = req.session.user.id;

      // Normalizar materias a Array
      const materiasArray = Array.isArray(materias)
        ? materias
        : materias
          ? [materias]
          : [];

      // 1. Validación de cantidad (Regla: 1 a 3 materias)
      if (materiasArray.length < 1 || materiasArray.length > 3) {
        return res.status(400).json({
          status: "error",
          message: "Debes seleccionar entre 1 y 3 materias.",
        });
      }

      // 2. Validar si ya votó
      const yaVoto = await EncuestasModel.verificarVoto(
        encuestaId,
        estudianteId,
      );
      if (yaVoto) {
        return res.status(400).json({
          status: "error",
          message: "Ya has registrado tu voto en esta encuesta.",
        });
      }

      // 3. Registrar votos
      await EncuestasModel.registrarVotos(
        encuestaId,
        estudianteId,
        materiasArray,
      );

      res.json({ status: "ok", message: "Votación registrada con éxito" });
    } catch (error) {
      console.error("Error al votar:", error);
      res.status(500).json({
        status: "error",
        message: "Error interno al procesar el voto",
      });
    }
  }

  // ==========================================
  // LÓGICA DE ADMIN (API / JSON)
  // ==========================================

  static async crearEncuesta(req, res) {
    try {
      const {
        titulo,
        descripcion,
        semestre,
        fecha_inicio,
        fecha_fin,
        materias,
      } = req.body;
      const creado_por = req.session?.user?.id || 1;
      const materiasArray = Array.isArray(materias) ? materias : [materias];

      await EncuestasModel.crear({
        titulo,
        descripcion,
        semestre,
        fecha_inicio,
        fecha_fin,
        materias: materiasArray,
        creado_por,
      });

      res.json({ status: "ok", message: "Encuesta creada con éxito" });
    } catch (error) {
      res.status(500).json({ status: "error", message: error.message });
    }
  }

  static async listarEncuestas(req, res) {
    try {
      const encuestas = await EncuestasModel.obtenerTodas();
      res.json({ status: "ok", data: encuestas });
    } catch (error) {
      res
        .status(500)
        .json({ status: "error", message: "Error al obtener encuestas" });
    }
  }

  static async actualizarEncuesta(req, res) {
    try {
      const {
        id,
        titulo,
        descripcion,
        semestre,
        fecha_inicio,
        fecha_fin,
        estado,
        materias,
      } = req.body;

      // Validación simple
      if (!id || !titulo) {
        return res.status(400).json({
          status: "error",
          message: "El ID y el Título son campos obligatorios.",
        });
      }

      // Preparamos el objeto para el modelo
      const data = {
        id,
        titulo,
        descripcion,
        semestre,
        fecha_inicio,
        fecha_fin,
        estado, // El nuevo campo que el administrador puede cambiar
        materias: materias || [], // Si no vienen materias, enviamos un array vacío
      };

      // Ejecutamos la actualización en la DB
      await EncuestasModel.actualizar(data);

      res.json({
        status: "ok",
        message: "Encuesta y materias actualizadas correctamente",
      });
    } catch (error) {
      console.error("Error en actualizarEncuesta:", error);
      res.status(500).json({
        status: "error",
        message: "Error interno al actualizar: " + error.message,
      });
    }
  }

  static async eliminarEncuesta(req, res) {
    try {
      const { id } = req.body;
      await EncuestasModel.borradoLogico(id);
      res.json({ status: "ok", message: "Encuesta eliminada" });
    } catch (error) {
      res.status(500).json({ status: "error", message: "Error al eliminar" });
    }
  }

  // Métodos de apoyo para selects dinámicos
  static async listarSemestres(req, res) {
    try {
      const semestres = await EncuestasModel.obtenerSemestres();
      res.json({ status: "ok", data: semestres });
    } catch (error) {
      res.status(500).json({ status: "error", message: error.message });
    }
  }

  static async listarMateriasPorSemestre(req, res) {
    try {
      // Obtenemos el semestre del query string (?semestre=3)
      const { semestre } = req.query;

      if (!semestre) {
        return res.json({ status: "ok", data: [] });
      }

      // ¡OJO AQUÍ! Verifica que en tu Modelo el método se llame así:
      const materias =
        await EncuestasModel.obtenerMateriasPorSemestre(semestre);

      return res.json({
        status: "ok",
        data: materias,
      });
    } catch (error) {
      console.error("Error detallado en el servidor:", error);
      return res.status(500).json({
        status: "error",
        message: "Error al obtener materias: " + error.message,
      });
    }
  }

  static async obtenerPorId(req, res) {
    try {
      const { id } = req.params;

      // Validamos que el ID exista
      if (!id) {
        return res
          .status(400)
          .json({ status: "error", message: "ID no proporcionado" });
      }

      const encuesta = await EncuestasModel.obtenerPorId(id);

      if (!encuesta) {
        return res
          .status(404)
          .json({ status: "error", message: "Encuesta no encontrada" });
      }

      const materias = await EncuestasModel.obtenerMateriasDeEncuesta(id);

      res.json({
        status: "ok",
        data: {
          ...encuesta,
          materias_seleccionadas: materias,
        },
      });
    } catch (error) {
      console.error("Error en obtenerPorId:", error); // Esto saldrá en tu consola de VS Code
      res.status(500).json({ status: "error", message: error.message });
    }
  }

  static async verResultados(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res
          .status(400)
          .json({ status: "error", message: "ID de encuesta requerido" });
      }

      const data = await EncuestasModel.obtenerResultados(id);

      res.json({
        status: "ok",
        encuesta_titulo: data.titulo,
        data: data.resultados, // Aquí viaja el array ordenado
      });
    } catch (error) {
      console.error("Error al obtener resultados:", error);
      res.status(500).json({ status: "error", message: error.message });
    }
  }

  // ==========================================
  // VISTAS (RENDER) - Solo cargan la estructura
  // ==========================================

  static async todasEncuestasEstudiantes(req, res) {
    try {
      const validaciones = await validarObtenerTodasEncuestasEstudiantes(req);

      if (validaciones.status === "error") {
        return respuestaAlFront(
          res,
          validaciones.status,
          validaciones.message,
          {},
          validaciones.codigo ? validaciones.codigo : 400,
        );
      }

      const todasEncuestas =
        await EncuestasModel.obtenerTodasEncuestasEstudiante(
          validaciones.usuarioId,
        );

      console.log(todasEncuestas);

      if (!todasEncuestas) {
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
        "Todas las encunestas para estudiantes obtenidas",
        {
          encuestas: todasEncuestas,
        },
        200,
      );
    } catch (error) {
      console.log("Error interno todas encuentas estudiantes:", error);

      return respuestaAlFront(
        res,
        "error",
        "Error interno todas encuestas estudiantes",
        {},
        500,
      );
    }
  }

  /** 
    static async verVistaEstudiante(req, res) {
      try {
        res.render("estudiante/encuestas", { 
          title: "Encuestas Disponibles",
          user: req.user // Si usas JWT, los datos vienen en req.user
        });
      } catch (error) {
        res.status(500).render("error", { message: "Error al cargar la página" });
      }
    }
  */

  static async vistaGestionar(req, res) {
    try {
      const semestres = await EncuestasModel.obtenerSemestres();
      res.render("admin/gestionar-encuestas", {
        semestres,
        title: "Gestionar Encuestas",
      });
    } catch (error) {
      res.status(500).send("Error en administración");
    }
  }

  // ==========================================
  // API (JSON) - Los datos para el Fetch
  // ==========================================

  static async listarEncuestasAPI(req, res) {
    try {
      const estudianteId = req.user.id;

      // UNIFICA EL NOMBRE: Asegúrate que en el Modelo se llame listarTodas
      const encuestasRaw = await EncuestasModel.obtenerTodas();

      const data = await Promise.all(
        encuestasRaw.map(async (encuesta) => {
          const materias = await EncuestasModel.obtenerMateriasDeEncuesta(
            encuesta.id,
          );
          const yaVoto = await EncuestasModel.verificarVoto(
            encuesta.id,
            estudianteId,
          );

          return {
            ...encuesta,
            materias,
            votado: yaVoto,
          };
        }),
      );

      res.json({ status: "ok", data });
    } catch (error) {
      console.error("Error API:", error);
      res
        .status(500)
        .json({ status: "error", message: "Error al obtener datos" });
    }
  }

  // ==========================================
  // LÓGICA DE VOTACIÓN
  // ==========================================

  static async registrarVoto(req, res) {
    try {
      const { encuestaId, materias } = req.body;
      const estudianteId = req.user.id;

      if (!materias || materias.length < 1 || materias.length > 3) {
        return res.status(400).json({
          status: "error",
          message: "Selecciona entre 1 y 3 materias.",
        });
      }

      const yaVoto = await EncuestasModel.verificarVoto(
        encuestaId,
        estudianteId,
      );
      if (yaVoto) {
        return res
          .status(400)
          .json({ status: "error", message: "Ya has participado." });
      }

      await EncuestasModel.guardarVotos(estudianteId, encuestaId, materias);
      res.json({ status: "ok", message: "Voto registrado" });
    } catch (error) {
      res.status(500).json({ status: "error", message: error.message });
    }
  }
}

export default EncuestasController;
