import EncuestasModel from '../models/EncuestasModel.js';

class EncuestasController {
    
    // ==========================================
    // VISTAS (RENDER)
    // ==========================================

    // Vista para el Admin
    static async vistaGestionar(req, res) {
        try {
            const semestres = await EncuestasModel.obtenerSemestres();
            const materias = await EncuestasModel.obtenerMaterias();
            res.render('admin/gestionar-encuestas', { 
                semestres, materias, title: 'Gestionar Encuestas' 
            });
        } catch (error) {
            res.status(500).send("Error al cargar la vista de administración");
        }
    }

    // Vista para el Estudiante
    static async vistaEstudiante(req, res) {
        try {
            const estudianteId = req.session.user.id;
            const semestreEstudiante = req.session.user.semestre; // Asumiendo que guardas el semestre en sesión

            // Usamos el método unificado del modelo
            const encuestas = await EncuestasModel.obtenerEncuestasParaEstudiante(estudianteId, semestreEstudiante);

            res.render('estudiante/encuestas', { 
                title: 'Encuestas Disponibles', 
                user: req.session.user,
                encuestas
            });
        } catch (error) {
            console.error('Error vista estudiante:', error);
            res.render('estudiante/encuestas', { 
                title: 'Encuestas Disponibles', 
                user: req.session.user,
                encuestas: [] 
            });
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
            const materiasArray = Array.isArray(materias) ? materias : (materias ? [materias] : []);

            // 1. Validación de cantidad (Regla: 1 a 3 materias)
            if (materiasArray.length < 1 || materiasArray.length > 3) {
                return res.status(400).json({ status: "error", message: "Debes seleccionar entre 1 y 3 materias." });
            }

            // 2. Validar si ya votó
            const yaVoto = await EncuestasModel.verificarVoto(encuestaId, estudianteId);
            if (yaVoto) {
                return res.status(400).json({ status: "error", message: "Ya has registrado tu voto en esta encuesta." });
            }

            // 3. Registrar votos
            await EncuestasModel.registrarVotos(encuestaId, estudianteId, materiasArray);

            res.json({ status: "ok", message: "Votación registrada con éxito" });
        } catch (error) {
            console.error("Error al votar:", error);
            res.status(500).json({ status: "error", message: "Error interno al procesar el voto" });
        }
    }

    // ==========================================
    // LÓGICA DE ADMIN (API / JSON)
    // ==========================================

    static async crearEncuesta(req, res) {
        try {
            const { titulo, descripcion, semestre, fecha_inicio, fecha_fin, materias } = req.body;
            const creado_por = req.session?.user?.id || 1;
            const materiasArray = Array.isArray(materias) ? materias : [materias];

            await EncuestasModel.crear({
                titulo, descripcion, semestre, fecha_inicio, fecha_fin,
                materias: materiasArray, creado_por
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
            res.status(500).json({ status: "error", message: "Error al obtener encuestas" });
        }
    }

    static async actualizarEncuesta(req, res) {
        try {
            const data = req.body;
            // Aquí va tu lógica para hacer el UPDATE en la DB
            await EncuestasModel.actualizar(data); 
            
            res.json({ status: 'ok', message: 'Encuesta actualizada' });
        } catch (error) {
            res.status(500).json({ status: 'error', message: error.message });
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
            const materias = await EncuestasModel.obtenerMateriasPorSemestre(semestre);
            
            return res.json({ 
                status: "ok", 
                data: materias 
            });

        } catch (error) {
            console.error("Error detallado en el servidor:", error);
            return res.status(500).json({ 
                status: "error", 
                message: "Error al obtener materias: " + error.message 
            });
        }
    }

    static async obtenerPorId(req, res) {
        try {
            const { id } = req.params;
            const encuesta = await EncuestasModel.obtenerPorId(id);
            const materias = await EncuestasModel.obtenerMateriasDeEncuesta(id);
            
            res.json({ 
                status: "ok", 
                data: { ...encuesta, materias_seleccionadas: materias } 
            });
        } catch (error) {
            res.status(500).json({ status: "error", message: error.message });
        }
    }
}

export default EncuestasController;