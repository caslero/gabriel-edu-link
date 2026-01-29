import { AdicionRetiroModel } from '../models/AdicionRetiroModel.js';

export class AdicionRetiroController {
    
    // 1. BUSCAR ESTUDIANTE
    static async buscarEstudiante(req, res) {
        try {
            const { cedula, pais } = req.body;
            // Limpiamos la cédula por si trae puntos o espacios
            const cedulaLimpia = cedula.replace(/[^0-9]/g, ''); 
            
            const estudiante = await AdicionRetiroModel.buscarEstudiantePorCedula(cedulaLimpia);

            if (estudiante) {
                return res.json({ status: "ok", estudiante });
            } else {
                return res.json({ status: "error", message: "Estudiante no registrado en el sistema" });
            }
        } catch (error) {
            console.error("Error en buscarEstudiante:", error);
            return res.status(500).json({ status: "error", message: "Error interno del servidor" });
        }
    }

    // 2. LISTAR SEMESTRES (Para el primer select)
    static async listarSemestres(req, res) {
        try {
            const semestres = await AdicionRetiroModel.obtenerSemestresUnicos();
            return res.json({ status: "ok", semestres });
        } catch (error) {
            return res.status(500).json({ status: "error", message: "Error al obtener semestres" });
        }
    }

    // 3. LISTAR MATERIAS (Depende del semestre)
    static async listarMaterias(req, res) {
        try {
            const { semestre } = req.query;
            const materias = await AdicionRetiroModel.obtenerMateriasPorSemestre(semestre);
            return res.json({ status: "ok", materias });
        } catch (error) {
            return res.status(500).json({ status: "error", message: "Error al obtener materias" });
        }
    }

    // 4. LISTAR SECCIONES (Depende de la materia)
    static async listarSecciones(req, res) {
        try {
            const { nombreMateria } = req.query;
            const secciones = await AdicionRetiroModel.obtenerSeccionesPorNombreMateria(nombreMateria);
            return res.json({ status: "ok", secciones });
        } catch (error) {
            return res.status(500).json({ status: "error", message: "Error al obtener secciones" });
        }
    }

    // 5. MOSTRAR VISTA (Renderizado inicial de la página)
    static async mostrarVista(req, res) {
        try {
            // Obtenemos los datos para las dos tablas
            const pendientes = await AdicionRetiroModel.obtenerPendientes();
            const procesadas = await AdicionRetiroModel.obtenerProcesadas();
            // Obtenemos semestres para el select inicial
            const semestres = await AdicionRetiroModel.obtenerSemestresUnicos();

            res.render('adicion_retiro', { 
                pendientes, 
                procesadas,
                semestres,
                usuario: req.session.usuario || null,
                // Pasamos arrays vacíos para evitar errores si el EJS los itera
                materias: [], 
                secciones: []
            });
        } catch (error) {
            console.error("Error al cargar la vista:", error);
            res.render('adicion_retiro', { 
                pendientes: [], 
                procesadas: [], 
                semestres: [],
                usuario: req.session.usuario || null 
            });
        }
    }

    // 6. CREAR REGISTRO (Desde el formulario del Admin)
  static async crearAdicionRetiro(req, res) {
    try {
        const { estudiante_id, seccion_id, tipo } = req.body;
        await AdicionRetiroModel.crearSolicitud({ estudiante_id, seccion_id, tipo });
        return res.json({ status: "ok", message: "Procesado con éxito" });
    } catch (error) {
        console.log("Error capturado en controlador:", error.message);
        return res.status(400).json({ status: "error", message: error.message });
    }
}

    // 7. ACTUALIZAR ESTADO (Aprobar/Rechazar desde la tabla de pendientes)
    static async actualizarEstado(req, res) {
        try {
            const { id, estado } = req.body;
            await AdicionRetiroModel.actualizarEstado(id, estado);
            res.json({ status: "ok", message: `Solicitud marcada como ${estado}` });
        } catch (error) {
            res.status(500).json({ status: "error", message: error.message });
        }
    }

    // 8. ELIMINAR (Borrado lógico)
    static async eliminar(req, res) {
        try {
            const { id } = req.body;
            await AdicionRetiroModel.eliminarLogico(id);
            res.json({ status: "ok", message: "Registro eliminado del historial" });
        } catch (error) {
            res.status(500).json({ status: "error", message: error.message });
        }
    }
    static async mostrarVista(req, res) {
        try {
            // Ejecutamos la función del modelo que me pasaste
            const listaProcesadas = await AdicionRetiroModel.obtenerProcesadas();
            
            // Enviamos 'procesadas' a la vista EJS
          const procesadas = await AdicionRetiroModel.obtenerProcesadas();
            res.render('adicion_retiro', { procesadas });
                // ... otras variables (semestres, pendientes, etc)
            
        } catch (error) {
            console.error("Error al obtener procesadas:", error);
            res.render('tu_archivo_vista', { procesadas: [] });
        }
    }
}