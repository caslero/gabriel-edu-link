import { db } from "../config/database.js";

export class InscripcionModel {
  
  /** Obtiene todos los datos para la gestión (Admin) */
  static async obtenerTodoGestion() {
    return new Promise(async (resolve, reject) => {
      try {
        const queries = {
          inscripciones: `SELECT i.id, i.creado_en, u.nombre AS estudiante_nombre, u.cedula,
                         m.nombre AS materia, sec.nombre AS seccion FROM inscripciones i
                         JOIN users u ON i.estudiante_id = u.id
                         JOIN materias m ON i.materia_id = m.id
                         JOIN secciones sec ON i.seccion_id = sec.id ORDER BY i.creado_en DESC`,
          estudiantes: "SELECT id, nombre, cedula FROM users WHERE rol_id = 3 ORDER BY nombre",
          semestres: "SELECT DISTINCT semestre FROM materias ORDER BY semestre",
          materias: "SELECT id, nombre, semestre FROM materias ORDER BY semestre, nombre",
          secciones: "SELECT id, nombre, materia_id FROM secciones ORDER BY nombre",
          solicitudes: `SELECT s.id, s.creado_en, u.nombre AS estudiante_nombre, u.cedula, 
                        m.nombre AS materia, sec.nombre AS seccion, s.estado, s.comentario
                        FROM solicitudes_inscripcion s JOIN users u ON s.estudiante_id = u.id
                        JOIN materias m ON s.materia_id = m.id LEFT JOIN secciones sec ON s.seccion_id = sec.id
                        ORDER BY s.creado_en DESC`
        };

        const data = {
          inscripciones: await new Promise((res, rej) => db.all(queries.inscripciones, [], (err, rows) => err ? rej(err) : res(rows))),
          estudiantes: await new Promise((res, rej) => db.all(queries.estudiantes, [], (err, rows) => err ? rej(err) : res(rows))),
          semestres: await new Promise((res, rej) => db.all(queries.semestres, [], (err, rows) => err ? rej(err) : res(rows))),
          materias: await new Promise((res, rej) => db.all(queries.materias, [], (err, rows) => err ? rej(err) : res(rows))),
          secciones: await new Promise((res, rej) => db.all(queries.secciones, [], (err, rows) => err ? rej(err) : res(rows))),
          solicitudes: await new Promise((res, rej) => db.all(queries.solicitudes, [], (err, rows) => err ? rej(err) : res(rows)))
        };

        resolve(data);
      } catch (error) {
        reject(error);
      }
    });
  }

  /** Crea una solicitud de inscripción (Usada por el Estudiante) */
  static async crearSolicitudEstudiante(datos) {
    return new Promise((resolve, reject) => {
      const sql = `INSERT INTO solicitudes_inscripcion (estudiante_id, materia_id, seccion_id, estado, creado_en)
                   VALUES (?, ?, ?, 'Pendiente', CURRENT_TIMESTAMP)`;
      
      const params = [datos.estudiante_id, datos.materia_id, datos.seccion_id];

      db.run(sql, params, function (err) {
        if (err) return reject(err);
        resolve({ id: this.lastID, ...datos });
      });
    });
  }

  /** Crea una inscripción manual (Directa por Admin) */
  static async crearInscripcionManual(datos) {
    return new Promise((resolve, reject) => {
      const sql = `INSERT INTO inscripciones (estudiante_id, materia_id, seccion_id, creado_en)
                   VALUES (?, ?, ?, CURRENT_TIMESTAMP)`;
      
      const params = [datos.estudiante_id, datos.materia_id, datos.seccion_id];

      db.run(sql, params, function (err) {
        if (err) return reject(err);
        resolve({ id: this.lastID, ...datos });
      });
    });
  }

  /** Busca estudiante por cédula */
  static async buscarEstudiantePorCedula(cedula) {
    return new Promise((resolve, reject) => {
      const sql = "SELECT id, nombre, cedula FROM users WHERE cedula = ? LIMIT 1";
      db.get(sql, [cedula], (err, row) => {
        if (err) return reject(err);
        resolve(row || null);
      });
    });
  }

  /** Actualiza el estado de una solicitud y procesa la inscripción si es aprobada */
  static async actualizarEstado(id, estado, comentario) {
    return new Promise((resolve, reject) => {
      const sql = "UPDATE solicitudes_inscripcion SET estado = ?, comentario = ? WHERE id = ?";
      
      db.run(sql, [estado, comentario, id], async function(err) {
        if (err) return reject(err);
        
        // Si el estado es "Aprobada", insertamos automáticamente en la tabla final
        if (estado === 'Aprobada') {
          try {
            const sol = await new Promise((res, rej) => 
              db.get("SELECT estudiante_id, materia_id, seccion_id FROM solicitudes_inscripcion WHERE id = ?", [id], (e, r) => e ? rej(e) : res(r))
            );
            
            if (sol) {
              await InscripcionModel.crearInscripcionManual(sol);
            }
          } catch (e) {
            return reject(e);
          }
        }
        
        resolve(this.changes > 0);
      });
    });
  }
}