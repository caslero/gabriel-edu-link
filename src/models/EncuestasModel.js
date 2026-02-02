import { db } from '../config/database.js';

class EncuestasModel {
    /**
     * Crea una encuesta y vincula sus materias en una sola transacción
     */
    static async crear({ titulo, descripcion, semestre, fecha_inicio, fecha_fin, materias, creado_por }) {
        return new Promise((resolve, reject) => {
            db.serialize(() => {
                db.run("BEGIN TRANSACTION");

                const sqlEncuesta = `
                    INSERT INTO encuestas (titulo, descripcion, semestre, fecha_inicio, fecha_fin, creado_por, estado)
                    VALUES (?, ?, ?, ?, ?, ?, 'Pendiente')
                `;

                db.run(sqlEncuesta, [titulo, descripcion, semestre, fecha_inicio, fecha_fin, creado_por], function(err) {
                    if (err) {
                        console.error("Error al insertar encuesta:", err.message);
                        db.run("ROLLBACK");
                        return reject(err);
                    }

                    const encuestaId = this.lastID;
                    const sqlMaterias = `INSERT INTO encuesta_materias (encuesta_id, materia_id) VALUES (?, ?)`;
                    const stmt = db.prepare(sqlMaterias);
                    
                    let errorEnMaterias = false;

                    // Si no hay materias, terminamos la transacción aquí
                    if (!materias || materias.length === 0) {
                        stmt.finalize();
                        db.run("COMMIT");
                        return resolve({ id: encuestaId });
                    }

                    materias.forEach(materiaId => {
                        stmt.run([encuestaId, materiaId], (err) => {
                            if (err) {
                                errorEnMaterias = true;
                                console.error("Error en materia ID:", materiaId, err.message);
                            }
                        });
                    });

                    stmt.finalize((err) => {
                        if (err || errorEnMaterias) {
                            db.run("ROLLBACK");
                            return reject(err || new Error("Error al insertar materias asociadas"));
                        }
                        
                        db.run("COMMIT");
                        console.log(`Encuesta ID ${encuestaId} creada exitosamente.`);
                        resolve({ id: encuestaId });
                    });
                });
            });
        });
    }

    /**
     * Obtiene los semestres disponibles de las materias existentes
     */
    static async obtenerSemestres() {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT DISTINCT semestre
                FROM materias 
                WHERE borrado = 0 AND semestre IS NOT NULL
                ORDER BY semestre ASC`;
            db.all(sql, [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    /**
     * Lista materias filtradas por semestre para el formulario dinámico
     */
    static async obtenerMateriasPorSemestre(semestre) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT id, nombre 
                FROM materias 
                WHERE semestre = ? 
                AND borrado = 0 
                GROUP BY nombre 
                ORDER BY nombre ASC
            `;
            db.all(sql, [semestre], (err, rows) => {
                if (err) reject(err); 
                else resolve(rows);
            });
        });
    }

    /**
     * Obtiene todas las encuestas para el listado principal
     */
    static async obtenerTodas() {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM encuestas WHERE borrado = 0 ORDER BY id DESC`;
            db.all(sql, [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    /**
     * Obtiene las materias específicas ligadas a una encuesta (para edición/ver)
     */
    static async obtenerMateriasDeEncuesta(encuestaId) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT m.id, m.nombre 
                FROM materias m
                JOIN encuesta_materias em ON m.id = em.materia_id
                WHERE em.encuesta_id = ?
            `;
            db.all(sql, [encuestaId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

   static async borradoLogico(id) {
        return new Promise((resolve, reject) => {
            const sql = `UPDATE encuestas SET borrado = 1 WHERE id = ?`;
            db.run(sql, [id], (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    }

    static async actualizar(id, { titulo, descripcion, semestre, fecha_inicio, fecha_fin, estado, materias }) {
        return new Promise((resolve, reject) => {
            db.serialize(() => {
                db.run("BEGIN TRANSACTION");

                const sql = `UPDATE encuestas SET titulo=?, descripcion=?, semestre=?, fecha_inicio=?, fecha_fin=?, estado=? WHERE id=?`;
                db.run(sql, [titulo, descripcion, semestre, fecha_inicio, fecha_fin, estado, id], (err) => {
                    if (err) {
                        db.run("ROLLBACK");
                        return reject(err);
                    }

                    // Borramos relaciones anteriores de materias
                    db.run("DELETE FROM encuesta_materias WHERE encuesta_id = ?", [id], (err) => {
                        if (err) {
                            db.run("ROLLBACK");
                            return reject(err);
                        }

                        const stmt = db.prepare("INSERT INTO encuesta_materias (encuesta_id, materia_id) VALUES (?, ?)");
                        materias.forEach(matId => stmt.run([id, matId]));
                        
                        stmt.finalize((err) => {
                            if (err) {
                                db.run("ROLLBACK");
                                return reject(err);
                            }
                            db.run("COMMIT");
                            resolve();
                        });
                    });
                });
            });
        });
    }


    /**
     * Obtiene el universo completo de materias (útil para el modal de edición)
     */
    static async obtenerMaterias() {
        return new Promise((resolve, reject) => {
            db.all("SELECT id, nombre, semestre FROM materias WHERE borrado = 0", [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }
}

    function filtrarMateriasEditar(encuestaId, semestreSeleccionado) {
        const items = document.querySelectorAll(`.item-edit-${encuestaId}`);
        
        items.forEach(item => {
            const semestreItem = item.getAttribute('data-semestre');
            if (semestreItem == semestreSeleccionado) {
                item.classList.remove('hidden');
            } else {
                item.classList.add('hidden');
                const cb = item.querySelector('input[type="checkbox"]');
                if (cb) cb.checked = false; // Limpia selecciones de otros semestres
            }
        });
    }
    
export default EncuestasModel;