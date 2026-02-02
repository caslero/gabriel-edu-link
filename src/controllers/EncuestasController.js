import EncuestasModel from '../models/EncuestasModel.js';

class EncuestasController {
    // Renderiza la vista con los datos necesarios para los select/checkbox
    static async vistaGestionar(req, res) {
        try {
            const semestres = await EncuestasModel.obtenerSemestres();
            const materias = await EncuestasModel.obtenerMaterias();
            
            res.render('admin/gestionar-encuestas', { 
                semestres, 
                materias,
                title: 'Gestionar Encuestas'
            });
        } catch (error) {
            res.status(500).send("Error al cargar la vista");
        }
    }

    static async listarSemestres(req, res) {
        try {
            const semestres = await EncuestasModel.obtenerSemestres();
            // El formato debe ser este:
            res.json({ status: "ok", data: semestres }); 
        } catch (error) {
            res.status(500).json({ status: "error", message: error.message });
        }
    }

    static async listarMateriasPorSemestre(req, res) {
        try {
            const { semestre } = req.params;
            const materias = await EncuestasModel.obtenerMateriasPorSemestre(semestre);
            res.json({ status: "ok", data: materias });
        } catch (error) {
            res.status(500).json({ status: "error", message: error.message });
        }
    }
   
    static async listarMateriasPorSemestre(req, res) {
        try {
            const { semestre } = req.query;

            if (!semestre) {
                return res.json({ status: "ok", data: [] });
            }

            // Llamada única al modelo
            const materias = await EncuestasModel.obtenerMateriasPorSemestre(semestre);
            
            // Enviamos la respuesta y cerramos la función
            return res.json({ 
                status: "ok", 
                data: materias 
            });

        } catch (error) {
            console.error("Error en listarMateriasPorSemestre:", error);
            return res.status(500).json({ status: "error", message: error.message });
        }
    }

    static async crearEncuesta(req, res) {
        try {
            const { titulo, descripcion, semestre, fecha_inicio, fecha_fin, materias } = req.body;
            
            // El error ocurre aquí. Vamos a darle un valor por defecto o validar:
            const creado_por = req.session?.userId || 1; // Usamos 1 como fallback si no hay sesión

            if (!creado_por) {
                return res.status(401).json({ status: "error", message: "Usuario no autenticado" });
            }

            // Aseguramos que materias sea un array
            const materiasArray = Array.isArray(materias) ? materias : [materias];

            await EncuestasModel.crear({
                titulo,
                descripcion,
                semestre,
                fecha_inicio,
                fecha_fin,
                materias: materiasArray,
                creado_por
            });

            res.json({ status: "ok", message: "Encuesta creada con éxito" });
        } catch (error) {
            console.error("Error en crearEncuesta:", error);
            res.status(500).json({ status: "error", message: error.message });
        }
    }

    static async listarEncuestas(req, res) {
        try {
            const encuestas = await EncuestasModel.obtenerTodas(); // Asegúrate de que este método devuelva las encuestas
            res.json({
                status: "ok",
                data: encuestas
            });
        } catch (error) {
            res.status(500).json({
                status: "error",
                message: "Error al obtener la lista de encuestas"
            });
        }
    }

    static async actualizarEncuesta(req, res) {
        try {
            // El ID viene del input hidden del modal
            const { id, titulo, descripcion, semestre, fecha_inicio, fecha_fin, estado, materias } = req.body;

            if (!id) throw new Error("ID de encuesta no recibido");

            const materiasArray = Array.isArray(materias) ? materias : (materias ? [materias] : []);

            await EncuestasModel.actualizar(id, {
                titulo, descripcion, semestre, fecha_inicio, fecha_fin, estado,
                materias: materiasArray
            });

            res.json({ status: "ok", message: "Datos actualizados" });
        } catch (error) {
            res.status(500).json({ status: "error", message: error.message });
        }
    }

    static async eliminarEncuesta(req, res) {
        try {
            const { id } = req.body;
            // Aplicamos borrado lógico: borrado = 1
            await EncuestasModel.borradoLogico(id);
            res.json({ status: "ok", message: "Encuesta eliminada" });
        } catch (error) {
            res.status(500).json({ status: "error", message: "No se pudo eliminar" });
        }
    }

}

export default EncuestasController;