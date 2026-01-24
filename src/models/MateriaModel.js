import { db } from "../config/database.js";

export class MateriaModel {
  /**
   Crea una nueva materia en la base de datos
   @param {Object} datos - Objeto con nombre, semestre y usuario_id
   @returns {Promise<Object>} - La materia creada incluyendo su nuevo ID
  */
  static async crearMateria(datos) {
    return new Promise((resolve, reject) => {
      // 1. Preparamos la sentencia SQL
      // Nota: Asegúrate de que los nombres de columnas coincidan con tu tabla
      const sql = `
      INSERT INTO materias (nombre, semestre, usuario_id) 
      VALUES (?, ?, ?)
    `;

      const params = [datos.nombre, datos.semestre, datos.usuario_id];

      // 2. Ejecutamos la inserción
      // Usamos una función tradicional (function) para poder acceder a 'this.lastID'
      db.run(sql, params, function (err) {
        if (err) {
          return reject(err);
        }

        // 3. Devolvemos el objeto creado con el ID que generó SQLite
        resolve({
          id: this.lastID,
          ...datos,
        });
      });
    });
  }

  /**
   Busca una materia por su nombre
   @param {string} nombre - El nombre a buscar
   @returns {Promise<Object|null>} - La materia encontrada o null
  */
  static async buscarMateriaPorNombre(nombre) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM materias WHERE nombre = ? LIMIT 1`;

      db.get(sql, [nombre], (err, row) => {
        if (err) {
          return reject(err);
        }
        // Si no hay errores, devolvemos la fila (o undefined si no existe)
        resolve(row || null);
      });
    });
  }

  /**
   Busca una materia por su id
   @param {string} id - El id a buscar
   @returns {Promise<Object|null>} - La materia encontrada o null
  */
  static async buscarMateriaPorId(id) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM materias WHERE id = ? LIMIT 1`;

      db.get(sql, [id], (err, row) => {
        if (err) {
          return reject(err);
        }
        // Si no hay errores, devolvemos la fila (o undefined si no existe)
        resolve(row || null);
      });
    });
  }

  /**
   Busca una materia por su nombre e id
   @param {string} nombre - El nombre a buscar
   @param {number} id - El ID de la materia a buscar
   @returns {Promise<Object|null>} - La materia encontrada o null
  */
  static async buscarMateriaActualizar(nombre, id) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM materias WHERE nombre = ? AND id != ? LIMIT 1`;

      db.get(sql, [nombre, id], (err, row) => {
        if (err) {
          return reject(err);
        }
        // Si no hay errores, devolvemos la fila (o undefined si no existe)
        resolve(row || null);
      });
    });
  }

  /**
   Actualiza una materia existente en la base de datos
   @param {Object} datos - Objeto con id, nombre y semestre
   @returns {Promise<Object>} - Los datos actualizados de la materia
  */
  static async actualizarMateria(id, nombre, semestre) {
    return new Promise((resolve, reject) => {
      // 1. Actualizar la materia
      const updateSql = `
        UPDATE materias 
        SET nombre = ?, semestre = ? 
        WHERE id = ?
      `;

      const updateParams = [nombre, semestre, id];

      db.run(updateSql, updateParams, function (err) {
        if (err) {
          return reject(err);
        }

        // 2. Verificar si se actualizó algo
        if (this.changes === 0) {
          return reject(new Error("No se encontró ninguna materia con ese ID"));
        }

        // 3. Consultar solo los datos de la materia (sin JOIN innecesario)
        const selectSql = `
          SELECT id, nombre, semestre, usuario_id, borrado 
          FROM materias 
          WHERE id = ?
        `;

        db.get(selectSql, [id], (err, materia) => {
          if (err) {
            return reject(err);
          }

          if (!materia) {
            return reject(
              new Error("No se pudo recuperar la materia actualizada"),
            );
          }

          // Devolvemos los datos actualizados de la materia
          resolve(materia);
        });
      });
    });
  }

  /**
   Eliminar una materia de manera lógica (soft delete) en la base de datos
   @param {number} id - ID de la materia a eliminar
   @returns {Promise<Object>} - La materia con el campo 'borrado' actualizado
  */
  static async eliminarMateria(id) {
    return new Promise((resolve, reject) => {
      // 1. Actualizar la materia
      const updateSql = `
        UPDATE materias 
        SET borrado = 1 
        WHERE id = ?
      `;

      const updateParams = [id];

      db.run(updateSql, updateParams, function (err) {
        if (err) {
          return reject(err);
        }

        // 2. Verificar si se actualizó algo
        if (this.changes === 0) {
          return reject(new Error("No se encontró ninguna materia con ese ID"));
        }

        // 3. Consultar solo los datos de la materia (sin JOIN innecesario)
        const selectSql = `
          SELECT id, nombre, semestre, usuario_id, borrado 
          FROM materias 
          WHERE id = ?
        `;

        db.get(selectSql, [id], (err, materia) => {
          if (err) {
            return reject(err);
          }

          if (!materia) {
            return reject(
              new Error("No se pudo recuperar la materia eliminada"),
            );
          }

          // Devolvemos los datos actualizados de la materia
          resolve(materia);
        });
      });
    });
  }

  /**
   Obtiene todos las materias
    @returns {Promise<Array<Object>>} - Lista de materias
  */
  static async obtenerTodasLasMaterias() {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM materias`;

      db.all(sql, [], (err, rows) => {
        if (err) {
          return reject(err);
        }
        // Devuelve todas las filas (array vacío si no hay registros)
        resolve(rows);
      });
    });
  }
}

/** 
import { db } from "../config/database.js";

export class MateriaModel {
  // --- Consultas de Materias ---
  static async obtenerTodo() {
    return new Promise((res, rej) => {
      db.all(`SELECT id, nombre, semestre FROM materias`, (err, rows) => err ? rej(err) : res(rows));
    });
  }

  static async obtenerSemestres() {
    return new Promise((res, rej) => {
      db.all(`SELECT DISTINCT semestre FROM materias`, (err, rows) => err ? rej(err) : res(rows));
    });
  }

  static async editarMateria(id, nombre, semestre) {
    return new Promise((res, rej) => {
      db.run(`UPDATE materias SET nombre = ?, semestre = ? WHERE id = ?`, [nombre, semestre, id], function(err) {
        err ? rej(err) : res(this.changes);
      });
    });
  }

  static async eliminarMateria(id) {
    return new Promise((res, rej) => {
      db.run('DELETE FROM materias WHERE id = ?', [id], function(err) {
        err ? rej(err) : res(this.changes);
      });
    });
  }

  // --- Consultas de Secciones ---
  static async obtenerSeccionesConDetalle() {
    const sql = `
      SELECT s.id, s.nombre AS seccion, m.nombre AS materia, m.semestre
      FROM secciones s
      JOIN materias m ON s.materia_id = m.id
      ORDER BY m.semestre, m.nombre, s.nombre`;
    return new Promise((res, rej) => {
      db.all(sql, (err, rows) => err ? rej(err) : res(rows));
    });
  }

  static async crearSeccion(nombre, materia_id) {
    return new Promise((res, rej) => {
      db.run(`INSERT INTO secciones (nombre, materia_id) VALUES (?, ?)`, [nombre, materia_id], function(err) {
        err ? rej(err) : res(this.lastID);
      });
    });
  }
}
*/
