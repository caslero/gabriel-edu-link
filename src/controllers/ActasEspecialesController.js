import { ActasEspecialesModel } from '../models/ActasEspecialesModel.js';
import { UserModel } from '../models/UserModel.js';

export class ActasEspecialesController {
    static async crearActaEspecial(req, res) {
        try {
            const { titulo, descripcion, tipo, docente_id, estudiante_id } = req.body;

            // --- EL CAMBIO ESTÁ AQUÍ ---
            // Verificamos si existe la sesión. Si no, usamos un ID por defecto (ej. 1)
            // Esto evita el error "Cannot read properties of undefined"
            const creado_por = (req.session && req.session.userId) ? req.session.userId : 1;
            // ---------------------------

            if (!titulo || !tipo || !docente_id) {
                return res.status(400).json({ 
                    status: "error", 
                    message: "Faltan campos obligatorios." 
                });
            }

            await ActasEspecialesModel.crear({
                titulo,
                descripcion,
                tipo,
                docente_id: parseInt(docente_id),
                estudiante_id: estudiante_id ? parseInt(estudiante_id) : null,
                creado_por: creado_por
            });

            res.json({ status: "ok", message: "Acta guardada con éxito" });

        } catch (error) {
            console.error("======= ERROR EN CREAR ACTA =======");
            console.error("Mensaje:", error.message);
            console.error("====================================");
            res.status(500).json({ status: "error", message: error.message });
        }
    }

    static async listarActas(req, res) {
        try {
            const actas = await ActasEspecialesModel.obtenerTodas();

            // Si es la API, enviamos el JSON que ya vimos que funciona
            if (req.originalUrl.includes('/api/')) {
                return res.json({ status: "ok", data: actas });
            }

            // Para la vista, intenta usar la ruta relativa más simple
            // Si el archivo está en views/admin/gestionar-actas-especiales.ejs
            res.render('admin/gestionar-actas-especiales', { 
                title: 'Gestión de Actas',
                actas: actas 
            }); 

        } catch (error) {
            console.error("Error:", error);
            res.status(500).send("Error interno: " + error.message);
        }
    }

   
    static async vistaGestionar(req, res) {
        try {
            const todasLasActas = await ActasEspecialesModel.obtenerTodas();
            
            // DEBUG: Esto imprimirá en la terminal de VS Code lo que llega de la DB
            console.log("Datos en DB:", todasLasActas);

            res.render('admin/gestionar-actas-especiales', { 
                title: 'Gestión de Actas Especiales',
                actas: todasLasActas, 
                docentes: await ActasEspecialesModel.obtenerDocentes(),
                estudiantes: await ActasEspecialesModel.obtenerEstudiantes(),
                solicitudes: todasLasActas.filter(a => a.estado === 'Pendiente')
            });
        } catch (error) {
            console.error("Error:", error);
            res.status(500).send("Error al cargar datos");
        }
    }


    // Función para obtener docentes
    static async obtenerDocentes(req, res) {
        try {
            const docentes = await ActasEspecialesModel.obtenerDocentes();
            
            return res.json({
                status: "ok",
                data: docentes
            });
        } catch (error) {
            console.error("Error al obtener docentes:", error.message);
            return res.status(500).json({
                status: "error",
                message: "No se pudo obtener la lista de docentes"
            });
        }
    }

    // Función para obtener estudiantes
    static async obtenerEstudiantes(req, res) {
        try {
            const estudiantes = await ActasEspecialesModel.obtenerEstudiantes();
            
            return res.json({
                status: "ok",
                data: estudiantes
            });
        } catch (error) {
            console.error("Error en obtenerEstudiantes (Controller):", error.message);
            return res.status(500).json({
                status: "error",
                message: error.message
            });
        }
    }
}