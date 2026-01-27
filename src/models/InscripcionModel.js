import { db } from "../config/database.js";

export class InscripcionModel {
    
    // 1. Buscar Estudiante (Solo usuarios con rol_id = 3)
    static async buscarEstudiantePorCedula(cedula, paisBit) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT id, nombre, rol_id, pais, borrado
                FROM users 
                WHERE TRIM(cedula) = TRIM(?) 
                LIMIT 1
            `;
            
            db.get(sql, [cedula], (err, row) => {
                if (err) return reject(err);
                
            
                resolve(row);
            });
        });
    }

    // 2. Obtener inscripciones (Ajustado a tus estados de tabla)
    static async obtenerConfirmadas() {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT 
                    i.id, 
                    u.nombre as estudiante_nombre,
                    u.cedula as id_usuario,
                    m.nombre as materia,
                    s.seccion_nombre as seccion,
                    i.estado,
                    strftime('%d/%m/%Y %H:%M', i.created_at) as creado_en
                FROM inscripciones i
                JOIN users u ON i.estudiante_id = u.id 
                JOIN secciones s ON i.seccion_id = s.id
                JOIN materias m ON s.materia_id = m.id
                WHERE i.borrado = 0 
                  AND i.estado IN ('Aprobada', 'Pendiente') -- Ajustado a tus CHECKs
                ORDER BY i.id DESC
            `;
            db.all(sql, [], (err, rows) => {
                if (err) {
                    console.error(" Error SQL en obtenerConfirmadas:", err.message);
                    return reject(err);
                }
                resolve(rows);
            });
        });
    }

    // 3. Crear inscripción (Asegurando estado 'Pendiente' por defecto)
    static async crearInscripcion(datos) {
        return new Promise((resolve, reject) => {
            const sql = `
                INSERT INTO inscripciones (estudiante_id, seccion_id, usuario_id, estado) 
                VALUES (?, ?, ?, 'Pendiente')
            `;
            
            db.run(sql, [datos.estudiante_id, datos.seccion_id, datos.usuario_id], function(err) {
                if (err) {
                    console.error(" Error al insertar inscripción:", err.message);
                    return reject(err);
                }
                resolve({ id: this.lastID });
            });
        });
    }

    // 4. METODO FALTANTE: Verificar si ya existe una inscripción activa
    static async verificarDuplicado(estudiante_id, materia_id) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT i.id 
                FROM inscripciones i
                JOIN secciones s ON i.seccion_id = s.id
                WHERE i.estudiante_id = ? 
                  AND s.materia_id = ? 
                  AND i.estado IN ('Pendiente', 'Aprobada') 
                  AND i.borrado = 0 
                LIMIT 1
            `;
            db.get(sql, [estudiante_id, materia_id], (err, row) => {
                if (err) return reject(err);
                resolve(row ? true : false);
            });
        });
    }

    // 5. METODO PARA GESTIONAR (Aprobar/Rechazar)
    static async actualizarEstado(id, estado, comentario, usuario_id) {
        return new Promise((resolve, reject) => {
            const sql = `
                UPDATE inscripciones 
                SET estado = ?, comentario = ?, gestionado_por = ?, updated_at = CURRENT_TIMESTAMP 
                WHERE id = ?
            `;
            db.run(sql, [estado, comentario, usuario_id, id], function(err) {
                if (err) return reject(err);
                resolve(this.changes > 0);
            });
        });
    }
    // 6. Obtener semestres
    static async obtenerSemestresUnicos() {
        return new Promise((resolve, reject) => {
            // Usamos DISTINCT sobre la columna 'semestre' de tu tabla 'materias'
            const sql = `
            SELECT DISTINCT semestre 
            FROM materias 
            WHERE borrado = 0 
            ORDER BY semestre ASC
            `;
            db.all(sql, [], (err, rows) => {
            if (err) return reject(err);
            resolve(rows); // Retorna [{semestre: 1}, {semestre: 2}, ...]
            });
        });
        }
        // 7. obtener materias
        static async obtenerMateriasPorSemestre(semestre) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT DISTINCT nombre FROM materias WHERE semestre = ? AND borrado = 0 ORDER BY nombre ASC`;
            db.all(sql, [semestre], (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });
    }
        // obtener secciones
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

    static async obtenerSeccionPorId(id) {
            return new Promise((resolve, reject) => {
                const sql = `SELECT id, materia_id, cupos FROM secciones WHERE id = ?`;
                db.get(sql, [id], (err, row) => {
                    if (err) reject(err);
                    resolve(row);
                });
            });
        }

    // Verificar si el alumno ya está en esa materia
    static async verificarDuplicado(estudianteId, materiaId) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT i.id 
                FROM inscripciones i
                JOIN secciones s ON i.seccion_id = s.id
                WHERE i.estudiante_id = ? AND s.materia_id = ? AND i.borrado = 0
            `;
            db.get(sql, [estudianteId, materiaId], (err, row) => {
                if (err) reject(err);
                resolve(row ? true : false);
            });
        });
}
}
          