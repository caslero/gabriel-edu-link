import { db } from "../config/database.js";

export class ActasEspecialesModel {
    static async crear(datos) {
        const { titulo, descripcion, tipo, docente_id, estudiante_id, creado_por } = datos;
        return new Promise((resolve, reject) => {
            const sql = `INSERT INTO actas_especiales 
                        (titulo, descripcion, tipo, docente_id, estudiante_id, creado_por, estado) 
                        VALUES (?, ?, ?, ?, ?, ?, 'Pendiente')`;
            
            db.run(sql, [titulo, descripcion, tipo, docente_id, estudiante_id, creado_por], function(err) {
                if (err) return reject(err);
                resolve({ id: this.lastID });
            });
        });
    }



    
    static async obtenerTodas() {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT 
                    a.id, 
                    a.titulo, 
                    a.tipo, 
                    a.estado, 
                    a.fecha_creacion, -- Nombre exacto de tu tabla
                    u1.nombre AS docente, 
                    u2.nombre AS estudiante
                FROM actas_especiales a
                LEFT JOIN users u1 ON a.docente_id = u1.id
                LEFT JOIN users u2 ON a.estudiante_id = u2.id
                WHERE a.borrado = 0
                ORDER BY a.id DESC
            `;
            db.all(sql, [], (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });
    }


    static async obtenerDocentes() {
        return new Promise((resolve, reject) => {
            // Seleccionamos id y nombre de los usuarios con rol de docente (2) que no estén borrados
            const sql = `
                SELECT id, nombre 
                FROM users 
                WHERE rol_id = 2 AND borrado = 0 
                ORDER BY nombre ASC
            `;
            db.all(sql, [], (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });
    }
    static async obtenerEstudiantes() {
        return new Promise((resolve, reject) => {
            // Seleccionamos id y nombre de los usuarios con rol de estudiante (3)
            const sql = `
                SELECT id, nombre 
                FROM users 
                WHERE rol_id = 3 AND borrado = 0 
                ORDER BY nombre ASC
            `;
            db.all(sql, [], (err, rows) => {
                if (err) {
                    console.error("ERROR SQL en obtenerEstudiantes:", err.message);
                    return reject(err);
                }
                resolve(rows || []);
            });
        });
    }
    

}