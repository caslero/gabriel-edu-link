import { db } from "../config/database.js";

export class SeccionModel {
  /**
   Crea una nueva seccion en la base de datos
   @param {Object} datos - Objeto con materia_id, seccion_nombre y cupos
   @returns {Promise<Object>} - La seccion creada incluyendo su nuevo ID
  */

  static async crearSeccion(datos) {
    return new Promise((resolve, reject) => {
      // 1. Insertar la nueva sección
      const insertSql = `
      INSERT INTO secciones (materia_id, seccion_nombre, cupos, usuario_id) 
      VALUES (?, ?, ?, ?)
    `;

      const insertParams = [
        datos.materia_id,
        datos.seccion_nombre,
        datos.cupos,
        datos.usuario_id,
      ];

      // 2. Ejecutar la inserción
      db.run(insertSql, insertParams, function (err) {
        if (err) {
          return reject(err);
        }

        const nuevaSeccionId = this.lastID;

        // 3. Consultar la sección recién creada con sus relaciones
        const selectSql = `
        SELECT 
          s.id,
          s.materia_id,
          s.seccion_nombre,
          s.cupos,
          s.borrado,
          s.usuario_id,
          s.created_at,
          s.updated_at,
          -- Datos de la materia
          m.nombre as materia_nombre,
          m.semestre as semestre,
          -- Datos del usuario creador
          u.nombre as usuario_nombre,
          u.cedula as usuario_cedula,
          u.correo as usuario_correo,
          -- Rol del usuario
          r.nombre as usuario_rol
        FROM secciones s
        INNER JOIN materias m ON s.materia_id = m.id
        INNER JOIN users u ON s.usuario_id = u.id
        INNER JOIN roles r ON u.rol_id = r.id
        WHERE s.id = ?
      `;

        db.get(selectSql, [nuevaSeccionId], (err, seccionCompleta) => {
          if (err) {
            return reject(err);
          }

          // 4. Formatear la respuesta
          const respuestaFormateada = {
            id: seccionCompleta.id,
            materia_id: seccionCompleta.materia_id,
            seccion_nombre: seccionCompleta.seccion_nombre,
            cupos: seccionCompleta.cupos,
            borrado: seccionCompleta.borrado,
            usuario_id: seccionCompleta.usuario_id,
            created_at: seccionCompleta.created_at,
            updated_at: seccionCompleta.updated_at,
            materia: {
              nombre: seccionCompleta.materia_nombre,
              semestre: seccionCompleta.semestre,
            },
            usuario: {
              nombre: seccionCompleta.usuario_nombre,
              cedula: seccionCompleta.usuario_cedula,
              correo: seccionCompleta.usuario_correo,
              rol: seccionCompleta.usuario_rol,
            },
          };

          // 5. Devolver la sección completa con relaciones
          resolve(respuestaFormateada);
        });
      });
    });
  }

  /**
    static async crearSeccion(datos) {
      return new Promise((resolve, reject) => {
        // 1. Preparamos la sentencia SQL
        // Nota: Asegúrate de que los nombres de columnas coincidan con tu tabla
        const sql = `
        INSERT INTO secciones (materia_id, seccion_nombre, cupos, usuario_id) 
        VALUES (?, ?, ?, ?)
      `;

        const params = [
          datos.materia_id,
          datos.seccion_nombre,
          datos.cupos,
          datos.usuario_id,
        ];

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
  */

  /**
   Busca una seccion por su nombre
   @param {string} seccion_nombre - El nombre a buscar
   @returns {Promise<Object|null>} - La seccion encontrada o null
  */
  static async buscarSeccionPorNombre(nombre) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM secciones WHERE seccion_nombre = ? LIMIT 1`;

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
   Busca una seccion por su id
   @param {string} id - El id a buscar
   @returns {Promise<Object|null>} - La seccion encontrada o null
  */
  static async buscarSeccionPorId(id) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM secciones WHERE id = ? LIMIT 1`;

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
   Busca una seccion por su seccion_nombre e id
   @param {string} seccion_nombre - El nombre a buscar
   @param {number} id - El ID de la seccion a buscar
   @returns {Promise<Object|null>} - La seccion encontrada o null
  */
  static async buscarSeccionActualizar(nombre, id) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM secciones WHERE seccion_nombre = ? AND id != ? LIMIT 1`;

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
   Busca una seccion por su seccion_nombre e id, esto es valido para crear secciones
   @param {string} seccion_nombre - El nombre a buscar
   @param {number} id - El ID de la seccion a buscar
   @returns {Promise<Object|null>} - La seccion encontrada o null
  */
  static async buscarSeccionNombreId(nombre, id) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM secciones WHERE seccion_nombre = ? AND id = ? LIMIT 1`;

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
   Actualiza una seccion existente en la base de datos
   @param {Object} datos - Objeto con id, materia_id, seccion_nombre y cupos
   @returns {Promise<Object>} - Los datos actualizados de la seccion
  */
  static async actualizarSeccion(id, materia_id, seccion_nombre, cupos) {
    return new Promise((resolve, reject) => {
      // 1. Actualizar la seccion
      const updateSql = `
        UPDATE secciones 
        SET materia_id = ?, seccion_nombre = ?, cupos = ? 
        WHERE id = ?
      `;

      const updateParams = [materia_id, seccion_nombre, cupos, id];

      db.run(updateSql, updateParams, function (err) {
        if (err) {
          return reject(err);
        }

        // 2. Verificar si se actualizó algo
        if (this.changes === 0) {
          return reject(new Error("No se encontró ninguna seccion con ese ID"));
        }

        // 3. Consultar solo los datos de la seccion (sin JOIN innecesario)
        const selectSql = `
          SELECT id, materia_id, seccion_nombre, cupos, usuario_id, borrado 
          FROM secciones 
          WHERE id = ?
        `;

        db.get(selectSql, [id], (err, seccion) => {
          if (err) {
            return reject(err);
          }

          if (!seccion) {
            return reject(
              new Error("No se pudo recuperar la seccion actualizada"),
            );
          }

          // Devolvemos los datos actualizados de la seccion
          resolve(seccion);
        });
      });
    });
  }

  /**
   Eliminar una seccion de manera lógica (soft delete) en la base de datos
   @param {number} id - ID de la seccion a eliminar
   @returns {Promise<Object>} - La seccion con el campo 'borrado' actualizado
  */
  static async eliminarSeccion(id) {
    return new Promise((resolve, reject) => {
      // 1. Actualizar la seccion
      const updateSql = `
        UPDATE secciones 
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
          return reject(new Error("No se encontró ninguna seccion con ese ID"));
        }

        // 3. Consultar solo los datos de la seccion (sin JOIN innecesario)
        const selectSql = `
          SELECT id, materia_id, seccion_nombre, cupos, usuario_id, borrado 
          FROM secciones 
          WHERE id = ?
        `;

        db.get(selectSql, [id], (err, seccion) => {
          if (err) {
            return reject(err);
          }

          if (!seccion) {
            return reject(
              new Error("No se pudo recuperar la seccion eliminada"),
            );
          }

          // Devolvemos los datos actualizados de la seccion
          resolve(seccion);
        });
      });
    });
  }

  /**
   Obtiene todos las secciones
    @returns {Promise<Array<Object>>} - Lista de secciones
  */
  static async obtenerTodasLasSecciones() {
    return new Promise((resolve, reject) => {
      const sql = `
      SELECT 
        s.*,
        m.nombre as materia_nombre,
        m.semestre as semestre,
        u.nombre as usuario_nombre
      FROM secciones s
      LEFT JOIN materias m ON s.materia_id = m.id
      LEFT JOIN users u ON s.usuario_id = u.id
      WHERE s.borrado = 0
      ORDER BY s.id DESC
    `;

      db.all(sql, [], (err, rows) => {
        if (err) {
          return reject(err);
        }
        resolve(rows);
      });
    });
  }

  /** 
    static async obtenerTodasLasSecciones() {
      return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM secciones`;

        db.all(sql, [], (err, rows) => {
          if (err) {
            return reject(err);
          }
          // Devuelve todas las filas (array vacío si no hay registros)
          resolve(rows);
        });
      });
    }
  */

  static async obtenerSeccionesPorUsuario(usuario_id) {
    return new Promise((resolve, reject) => {
      const sql = `
      SELECT 
        s.*,
        m.nombre as materia_nombre,
        m.semestre as materia_semestre,
        u.nombre as usuario_nombre
      FROM secciones s
      LEFT JOIN materias m ON s.materia_id = m.id
      LEFT JOIN users u ON s.usuario_id = u.id
      WHERE s.borrado = 0 AND s.usuario_id = ?
      ORDER BY s.created_at DESC
    `;

      db.all(sql, [usuario_id], (err, rows) => {
        if (err) {
          return reject(err);
        }
        resolve(rows);
      });
    });
  }

  static async obtenerTodasSeccionesBorradas() {
    return new Promise((resolve, reject) => {
      const sql = `
      SELECT 
        s.*,
        m.nombre as materia_nombre,
        m.semestre as materia_semestre,
        u.nombre as usuario_nombre,
        CASE 
          WHEN s.borrado = 1 THEN 'Eliminada'
          ELSE 'Activa'
        END as estado
      FROM secciones s
      LEFT JOIN materias m ON s.materia_id = m.id
      LEFT JOIN users u ON s.usuario_id = u.id
      ORDER BY s.borrado, s.created_at DESC
    `;

      db.all(sql, [], (err, rows) => {
        if (err) {
          return reject(err);
        }
        resolve(rows);
      });
    });
  }
}
