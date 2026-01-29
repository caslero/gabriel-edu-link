import { db } from '../config/database.js';

export class AdicionRetiroModel {
    /**
     * Busca un usuario por cédula
     */
    static async buscarEstudiantePorCedula(cedula) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT id, nombre, rol_id, pais, borrado
                FROM users 
                WHERE TRIM(cedula) = TRIM(?) 
                AND borrado = 0
                LIMIT 1
            `;
            db.get(sql, [cedula], (err, row) => {
                if (err) return reject(err);
                resolve(row);
            });
        });
    }

    /**
     * Obtiene semestres únicos de la tabla materias
     */
    static async obtenerSemestresUnicos() {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT DISTINCT semestre 
                FROM materias 
                WHERE borrado = 0 
                ORDER BY semestre ASC
            `;
            db.all(sql, [], (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });
    }

    /**
     * Obtiene nombres de materias por semestre
     */
    static async obtenerMateriasPorSemestre(semestre) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT DISTINCT nombre 
                FROM materias 
                WHERE semestre = ? AND borrado = 0 
                ORDER BY nombre ASC
            `;
            db.all(sql, [semestre], (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });
    }

    /**
     * Obtiene secciones por el nombre de la materia
     */
    static async obtenerSeccionesPorNombreMateria(nombreMateria) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT s.id, s.seccion_nombre, s.cupos 
                FROM secciones s
                JOIN materias m ON s.materia_id = m.id
                WHERE m.nombre = ? 
                  AND s.borrado = 0 
                  AND m.borrado = 0
                ORDER BY s.seccion_nombre ASC
            `;
            db.all(sql, [nombreMateria], (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });
    }

    /**
     * Obtiene solicitudes pendientes
     */
    static async obtenerPendientes() {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT ar.id, u.nombre AS estudiante_nombre, m.nombre AS materia, ar.tipo, ar.estado
                FROM adicion_retiro ar
                JOIN users u ON ar.usuario_id = u.id
                JOIN secciones s ON ar.seccion_id = s.id
                JOIN materias m ON s.materia_id = m.id
                WHERE ar.estado = 'Pendiente' AND ar.borrado = 0
                ORDER BY ar.id DESC
            `;
            db.all(sql, [], (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });
    }

    /**
     * Obtiene solicitudes procesadas
     */
    static async obtenerProcesadas() {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT 
                    ar.id, 
                    u.nombre AS estudiante_nombre, 
                    ar.estado 
                FROM adicion_retiro ar
                JOIN users u ON ar.usuario_id = u.id
                WHERE ar.estado IN ('Aprobada', 'Rechazada') AND ar.borrado = 0
                ORDER BY ar.id DESC
            `;
            db.all(sql, [], (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });
    }

    /**
     * CREAR SOLICITUD
     */
    static async crearSolicitud({ estudiante_id, seccion_id, tipo, estado = 'Aprobada' }) {
        return new Promise((resolve, reject) => {
            // Log para ver qué llega al modelo
            console.log("DEBUG MODELO - Datos recibidos:", { estudiante_id, seccion_id, tipo });

            const sqlCheck = `
                SELECT ar.id FROM adicion_retiro ar
                JOIN secciones s_nueva ON s_nueva.id = ?
                JOIN secciones s_existente ON ar.seccion_id = s_existente.id
                WHERE ar.usuario_id = ? 
                AND s_existente.materia_id = s_nueva.materia_id
                AND ar.estado IN ('Aprobada', 'Pendiente')
                AND ar.borrado = 0
            `;

            db.get(sqlCheck, [seccion_id, estudiante_id], (err, row) => {
                if (err) {
                    console.error("ERROR EN SQL_CHECK:", err.message);
                    return reject(err);
                }

                if (row && tipo === 'Adicion') {
                    console.log("VALIDACIÓN: El estudiante ya tiene esta materia.");
                    return reject(new Error("Materia ya registrada para este alumno"));
                }

                const sqlInsert = `
                    INSERT INTO adicion_retiro (usuario_id, seccion_id, tipo, estado, fecha) 
                    VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
                `;
                
                db.run(sqlInsert, [estudiante_id, seccion_id, tipo, estado], function(err) {
                    if (err) {
                        console.error("ERROR EN INSERT:", err.message);
                        return reject(err);
                    }
                    console.log("INSERCIÓN EXITOSA - ID:", this.lastID);
                    resolve({ id: this.lastID });
                });
            });
        });
    }

    /**
     * Actualiza el estado (Aprobada/Rechazada)
     */
    static async actualizarEstado(id, estado) {
        return new Promise((resolve, reject) => {
            const sql = `UPDATE adicion_retiro SET estado = ? WHERE id = ?`;
            db.run(sql, [estado, id], function(err) {
                if (err) return reject(err);
                resolve(this.changes);
            });
        });
    }

    /**
     * Borrado lógico
     */
    static async eliminarLogico(id) {
        return new Promise((resolve, reject) => {
            const sql = `UPDATE adicion_retiro SET borrado = 1 WHERE id = ?`;
            db.run(sql, [id], function(err) {
                if (err) return reject(err);
                resolve(this.changes);
            });
        });
    }
}