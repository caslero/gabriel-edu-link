import { db } from "../config/database.js";

class EncuestasModel {
  /**
   Obtiene todas las encuestas del estudiante
   @param {number} usuario_id - ID del estudiante
   @returns {Promise<Array<Object>>} - Lista de encuestas
 */
static async obtenerTodasEncuestasEstudiante(usuario_id) {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT DISTINCT
        e.id, 
        e.titulo, 
        e.descripcion, 
        e.fecha_inicio, 
        e.fecha_fin,
        e.semestre,
        CASE 
            WHEN date('now') < date(e.fecha_inicio) THEN 'Pendiente'
            WHEN date('now') BETWEEN date(e.fecha_inicio) AND date(e.fecha_fin) THEN 'Activa'
            ELSE 'Finalizada'
        END as estado,
        CASE 
            WHEN v.id IS NOT NULL THEN 1 
            ELSE 0 
        END as ya_votado
      FROM encuestas e
      LEFT JOIN votos v ON e.id = v.encuesta_id AND v.estudiante_id = ?
      WHERE e.borrado = 0 
        AND e.semestre IN (
          SELECT DISTINCT CAST(m.semestre AS TEXT)
          FROM inscripciones i
          INNER JOIN secciones s ON i.seccion_id = s.id
          INNER JOIN materias m ON s.materia_id = m.id
          WHERE i.estudiante_id = ? 
            AND i.estado = 'Aprobada'
            AND i.borrado = 0
        )
      ORDER BY e.fecha_inicio DESC`;
    
    db.all(sql, [usuario_id, usuario_id], (err, rows) => {
      if (err) {
        console.error("Error obteniendo encuestas del estudiante:", err);
        return reject(err);
      }
      
      resolve(rows || []);
    });
  });
}
















  

  // --- MÉTODOS EXISTENTES (ADMIN) ---

  static async obtenerTodas() {
    return new Promise((resolve, reject) => {
      // Usamos CASE de SQL para determinar el estado según la fecha actual ('now')
      const sql = `
        SELECT id, titulo, descripcion, semestre, fecha_inicio, fecha_fin,
        CASE 
          WHEN date('now') < date(fecha_inicio) THEN 'Pendiente'
          WHEN date('now') BETWEEN date(fecha_inicio) AND date(fecha_fin) THEN 'Activa'
          ELSE 'Finalizada'
        END as estado
        FROM encuestas 
        WHERE borrado = 0 
        ORDER BY id DESC`;

      db.all(sql, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
  static async crear({
    titulo,
    descripcion,
    semestre,
    fecha_inicio,
    fecha_fin,
    materias,
    creado_por,
  }) {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run("BEGIN TRANSACTION");
        const sqlEncuesta = `
                    INSERT INTO encuestas (titulo, descripcion, semestre, fecha_inicio, fecha_fin, creado_por, estado)
                    VALUES (?, ?, ?, ?, ?, ?, 'Pendiente')
                `;
        db.run(
          sqlEncuesta,
          [titulo, descripcion, semestre, fecha_inicio, fecha_fin, creado_por],
          function (err) {
            if (err) {
              db.run("ROLLBACK");
              return reject(err);
            }
            const encuestaId = this.lastID;
            const stmt = db.prepare(
              `INSERT INTO encuesta_materias (encuesta_id, materia_id) VALUES (?, ?)`,
            );
            if (!materias || materias.length === 0) {
              stmt.finalize();
              db.run("COMMIT");
              return resolve({ id: encuestaId });
            }
            materias.forEach((mId) => stmt.run([encuestaId, mId]));
            stmt.finalize((err) => {
              if (err) {
                db.run("ROLLBACK");
                return reject(err);
              }
              db.run("COMMIT");
              resolve({ id: encuestaId });
            });
          },
        );
      });
    });
  }

  static async actualizar(
    id,
    {
      titulo,
      descripcion,
      semestre,
      fecha_inicio,
      fecha_fin,
      estado,
      materias,
    },
  ) {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run("BEGIN TRANSACTION");
        const sql = `UPDATE encuestas SET titulo=?, descripcion=?, semestre=?, fecha_inicio=?, fecha_fin=?, estado=? WHERE id=?`;
        db.run(
          sql,
          [titulo, descripcion, semestre, fecha_inicio, fecha_fin, estado, id],
          (err) => {
            if (err) {
              db.run("ROLLBACK");
              return reject(err);
            }
            db.run(
              "DELETE FROM encuesta_materias WHERE encuesta_id = ?",
              [id],
              (err) => {
                if (err) {
                  db.run("ROLLBACK");
                  return reject(err);
                }
                const stmt = db.prepare(
                  "INSERT INTO encuesta_materias (encuesta_id, materia_id) VALUES (?, ?)",
                );
                materias.forEach((matId) => stmt.run([id, matId]));
                stmt.finalize((err) => {
                  if (err) {
                    db.run("ROLLBACK");
                    return reject(err);
                  }
                  db.run("COMMIT");
                  resolve();
                });
              },
            );
          },
        );
      });
    });
  }

  // --- MÉTODOS NUEVOS (PARA ESTUDIANTES Y VISTAS DETALLADAS) ---

  /**
   * Obtiene encuestas filtradas por el semestre del estudiante y verifica si ya votó
   */
  static async obtenerEncuestasParaEstudiante(
    estudianteId,
    semestreEstudiante,
  ) {
    return new Promise((resolve, reject) => {
      // Buscamos encuestas que coincidan con el semestre del estudiante y no estén borradas
      const sql = `
                SELECT id, titulo, descripcion, semestre, fecha_inicio, fecha_fin, estado
                FROM encuestas
                WHERE semestre = ? AND borrado = 0 AND estado != 'Pendiente'
                ORDER BY fecha_inicio DESC
            `;
      db.all(sql, [semestreEstudiante], async (err, rows) => {
        if (err) return reject(err);

        // Para cada encuesta, adjuntamos materias y estado de voto
        const encuestasPromesas = rows.map(async (encuesta) => {
          encuesta.materias = await this.obtenerMateriasDeEncuesta(encuesta.id);
          encuesta.yaVoto = await this.verificarVoto(encuesta.id, estudianteId);
          if (encuesta.estado === "Finalizada") {
            encuesta.resultados = await this.obtenerResultadosVotacion(
              encuesta.id,
            );
          }
          return encuesta;
        });

        resolve(await Promise.all(encuestasPromesas));
      });
    });
  }
  static async obtenerPorId(id) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM encuestas WHERE id = ? AND borrado = 0`;
      db.get(sql, [id], (err, row) => {
        if (err) {
          console.error("Error SQL en obtenerPorId:", err);
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }
  static async verificarVoto(encuestaId, estudianteId) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT 1 FROM votos WHERE encuesta_id = ? AND estudiante_id = ? LIMIT 1`;
      db.get(sql, [encuestaId, estudianteId], (err, row) => {
        if (err) reject(err);
        else resolve(!!row);
      });
    });
  }

  /**
   * Registra los votos de un estudiante en una transacción
   */
  static async registrarVotos(encuestaId, estudianteId, materiasIds) {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run("BEGIN TRANSACTION");
        const stmt = db.prepare(
          `INSERT INTO votos (encuesta_id, estudiante_id, materia_id) VALUES (?, ?, ?)`,
        );

        materiasIds.forEach((materiaId) => {
          stmt.run([encuestaId, estudianteId, materiaId]);
        });

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
  }

  /**
   * Obtiene el conteo de votos por materia (Para Admin o Resultados Estudiante)
   */
  static async obtenerResultadosVotacion(encuestaId) {
    return new Promise((resolve, reject) => {
      const sql = `
                SELECT m.nombre, COUNT(v.id) as total_votos
                FROM encuesta_materias em
                JOIN materias m ON em.materia_id = m.id
                LEFT JOIN votos v ON v.encuesta_id = em.encuesta_id AND v.materia_id = m.id
                WHERE em.encuesta_id = ?
                GROUP BY m.id
                ORDER BY total_votos DESC
            `;
      db.all(sql, [encuestaId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  // --- MÉTODOS DE APOYO ---

  static async obtenerTodas() {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT * FROM encuestas WHERE borrado = 0 ORDER BY id DESC`,
        [],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        },
      );
    });
  }

  static async obtenerMateriasDeEncuesta(encuesta_id) {
    return new Promise((resolve, reject) => {
      const sql = `
                SELECT m.id, m.nombre 
                FROM materias m
                JOIN encuesta_materias em ON m.id = em.materia_id
                WHERE em.encuesta_id = ?`;
      db.all(sql, [encuesta_id], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static async obtenerMateriasPorSemestre(semestre) {
    return new Promise((resolve, reject) => {
      const sql = `
                SELECT MIN(id) as id, nombre 
                FROM materias 
                WHERE semestre = ? 
                AND borrado = 0 
                GROUP BY nombre 
                ORDER BY nombre ASC
            `;
      db.all(sql, [semestre], (err, rows) => {
        if (err) {
          console.error("SQL Error:", err);
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  static async borradoLogico(id) {
    return new Promise((resolve, reject) => {
      db.run(`UPDATE encuestas SET borrado = 1 WHERE id = ?`, [id], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  static async obtenerSemestres() {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT DISTINCT semestre FROM materias WHERE borrado = 0 AND semestre IS NOT NULL ORDER BY semestre ASC`,
        [],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        },
      );
    });
  }
  static async actualizar(data) {
    const {
      id,
      titulo,
      descripcion,
      semestre,
      fecha_inicio,
      fecha_fin,
      estado,
      materias,
    } = data;
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run("BEGIN TRANSACTION");

        const sql = `UPDATE encuestas SET 
                          titulo = ?, descripcion = ?, semestre = ?, 
                          fecha_inicio = ?, fecha_fin = ?, estado = ? 
                          WHERE id = ?`;

        db.run(
          sql,
          [titulo, descripcion, semestre, fecha_inicio, fecha_fin, estado, id],
          (err) => {
            if (err) {
              db.run("ROLLBACK");
              return reject(err);
            }

            // ... (aquí sigue tu lógica de borrar e insertar materias que ya tenías)
            db.run(
              "DELETE FROM encuesta_materias WHERE encuesta_id = ?",
              [id],
              (err) => {
                if (err) {
                  db.run("ROLLBACK");
                  return reject(err);
                }

                const stmt = db.prepare(
                  "INSERT INTO encuesta_materias (encuesta_id, materia_id) VALUES (?, ?)",
                );
                materias.forEach((mId) => stmt.run([id, mId]));
                stmt.finalize(() => {
                  db.run("COMMIT");
                  resolve();
                });
              },
            );
          },
        );
      });
    });
  }

  static async obtenerResultados(encuestaId) {
    return new Promise((resolve, reject) => {
      // Esta consulta hace lo siguiente:
      // 1. Obtiene el título de la encuesta.
      // 2. Cuenta los votos por cada materia vinculada a esa encuesta.
      // 3. Incluye materias incluso si tienen 0 votos (LEFT JOIN).
      const sql = `
              SELECT 
                  e.titulo AS encuesta_titulo,
                  m.nombre AS materia_nombre,
                  COUNT(v.id) AS total_votos
              FROM encuestas e
              JOIN encuesta_materias em ON e.id = em.encuesta_id
              JOIN materias m ON em.materia_id = m.id
              LEFT JOIN votos v ON v.encuesta_id = e.id AND v.materia_id = m.id
              WHERE e.id = ?
              GROUP BY m.id
              ORDER BY total_votos DESC
          `;

      db.all(sql, [encuestaId], (err, rows) => {
        if (err) return reject(err);

        if (rows.length === 0) {
          return resolve({ titulo: "Sin datos", resultados: [] });
        }

        // Formateamos la respuesta
        const respuesta = {
          titulo: rows[0].encuesta_titulo,
          resultados: rows.map((r) => ({
            nombre: r.materia_nombre,
            votos: r.total_votos,
          })),
        };

        resolve(respuesta);
      });
    });
  }

  static async registrarVoto(estudianteId, encuestaId, materiaId) {
    return new Promise((resolve, reject) => {
      const sql = `INSERT INTO votos (estudiante_id, encuesta_id, materia_id) VALUES (?, ?, ?)`;

      db.run(sql, [estudianteId, encuestaId, materiaId], function (err) {
        if (err) {
          if (err.message.includes("UNIQUE constraint failed")) {
            return reject(new Error("Ya has participado en esta encuesta."));
          }
          return reject(err);
        }
        resolve({ id: this.lastID });
      });
    });
  }

  // Obtener encuestas básicas
  static async listarParaEstudiantes() {
    return new Promise((resolve, reject) => {
      db.all(
        "SELECT * FROM encuestas ORDER BY fecha_inicio DESC",
        [],
        (err, rows) => {
          if (err) reject(err);
          resolve(rows);
        },
      );
    });
  }

  // Verificar si ya existe un voto (para el campo 'votado')
  static async verificarVoto(estudianteId, encuestaId) {
    return new Promise((resolve, reject) => {
      const sql =
        "SELECT id FROM votos WHERE estudiante_id = ? AND encuesta_id = ? LIMIT 1";
      db.get(sql, [estudianteId, encuestaId], (err, row) => {
        if (err) reject(err);
        resolve(!!row); // Devuelve true si existe, false si no
      });
    });
  }

  static async listarTodas() {
    return new Promise((resolve, reject) => {
      // Traemos todas las encuestas, puedes filtrar por semestre si lo deseas
      const sql = `SELECT * FROM encuestas ORDER BY fecha_inicio DESC`;

      db.all(sql, [], (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });
  }

  static async listarEncuestasAPI(req, res) {
    try {
      const estudianteId = 1; // Luego lo obtendrás del JWT
      const listaEncuestas = await EncuestasModel.listarTodasConMaterias();

      // Procesamos los datos igual que antes
      const data = await Promise.all(
        listaEncuestas.map(async (encuesta) => {
          const yaVoto = await EncuestasModel.verificarVotoExistente(
            estudianteId,
            encuesta.id,
          );
          return { ...encuesta, votado: yaVoto };
        }),
      );

      // IMPORTANTE: Devolver JSON con status ok
      return res.json({ status: "ok", data: data });
    } catch (error) {
      console.error("Error API:", error);
      res.status(500).json({ status: "error", message: error.message });
    }
  }
  static async verificarVotoExistente(estudianteId, encuestaId) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT id FROM votos WHERE estudiante_id = ? AND encuesta_id = ? LIMIT 1`;
      db.get(sql, [estudianteId, encuestaId], (err, row) => {
        if (err) return reject(err);
        resolve(!!row); // Retorna true si existe un registro, false si no
      });
    });
  }
}

export default EncuestasModel;
