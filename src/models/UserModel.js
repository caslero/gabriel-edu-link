import { db } from "../config/database.js";
import bcrypt from "bcryptjs";

export class UserModel {
  /**
   Crea un nuevo usuario en la base de datos
   @param {Object} datos - Objeto con nombre, correo, clave y token
   @returns {Promise<Object>} - El usuario creado incluyendo su nuevo ID
  */
  static async crearUsuario(datos) {
    return new Promise((resolve, reject) => {
      // 1. Preparamos la sentencia SQL
      // Nota: Asegúrate de que los nombres de columnas coincidan con tu tabla
      const sql = `
      INSERT INTO users (cedula, nombre, correo, clave, pais, rol_id, foto, token) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

      const params = [
        datos.cedula,
        datos.nombre,
        datos.correo,
        datos.clave,
        datos.pais,
        datos.rol_id,
        datos.foto,
        datos.token,
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

  /**
   Busca un usuario por su token
   @param {string} token - El token a buscar
   @returns {Promise<Object|null>} - El usuario encontrado o null
  */
  static async buscarUsuarioPorToken(token) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM users WHERE token = ? LIMIT 1`;

      db.get(sql, [token], (err, row) => {
        if (err) {
          return reject(err);
        }
        // Si no hay errores, devolvemos la fila (o undefined si no existe)
        resolve(row || null);
      });
    });
  }

  /**
   Busca un usuario por su correo
   @param {string} correo - El correo a buscar
   @returns {Promise<Object|null>} - El usuario encontrado o null
  */
  static async buscarUsuarioPorCorreo(correo) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM users WHERE correo = ? LIMIT 1`;

      db.get(sql, [correo], (err, row) => {
        if (err) {
          return reject(err);
        }
        // Si no hay errores, devolvemos la fila (o undefined si no existe)
        resolve(row || null);
      });
    });
  }

  /**
   Busca un usuario por su cedula
   @param {string} cedula - La cedula a buscar
   @returns {Promise<Object|null>} - El usuario encontrado o null
  */
  static async buscarUsuarioCedula(cedula, pais) {
    return new Promise((resolve, reject) => {
      const sql = `
      SELECT id, cedula, nombre, rol_id, pais, borrado, correo, foto
      FROM users 
      WHERE cedula = ? AND rol_id = 3 AND pais = ?
      LIMIT 1
    `;

      db.get(sql, [cedula, pais], (err, row) => {
        if (err) {
          return reject(err);
        }
        // Si no hay errores, devolvemos la fila (o undefined si no existe)
        resolve(row || null);
      });
    });
  }

  /**
   Busca un usuario por su id
   @param {string} id - El id a buscar
   @returns {Promise<Object|null>} - El usuario encontrado o null
  */
  static async buscarUsuarioPorId(id) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM users WHERE id = ? LIMIT 1`;

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
   Busca un usuario por su correo e id
   @param {string} correo - El correo a buscar
   @param {number} id - El ID del usuario a buscar
   @returns {Promise<Object|null>} - El usuario encontrado o null
  */
  static async buscarUsuarioActualizar(correo, id) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM users WHERE correo = ? AND id != ? LIMIT 1`;

      db.get(sql, [correo, id], (err, row) => {
        if (err) {
          return reject(err);
        }
        // Si no hay errores, devolvemos la fila (o undefined si no existe)
        resolve(row || null);
      });
    });
  }

  /**
   Actualiza un usuario existente en la base de datos
   @param {Object} datos - Objeto con id, nombre, correo y rol_id
   @returns {Promise<Object>} - Los datos actualizados del usuario
  */
  static async actualizarUsuario(id, nombre, correo, rol_id) {
    return new Promise((resolve, reject) => {
      // 1. Actualizar el usuario
      const updateSql = `
        UPDATE users 
        SET nombre = ?, correo = ?, rol_id = ? 
        WHERE id = ?
      `;

      const updateParams = [nombre, correo, rol_id, id];

      db.run(updateSql, updateParams, function (err) {
        if (err) {
          return reject(err);
        }

        // 2. Verificar si se actualizó algo
        if (this.changes === 0) {
          return reject(new Error("No se encontró ningún usuario con ese ID"));
        }

        // 3. Consultar solo los datos del usuario (sin JOIN innecesario)
        const selectSql = `
          SELECT id, nombre, correo, rol_id, borrado 
          FROM users 
          WHERE id = ?
        `;

        db.get(selectSql, [id], (err, usuario) => {
          if (err) {
            return reject(err);
          }

          if (!usuario) {
            return reject(
              new Error("No se pudo recuperar el usuario actualizado"),
            );
          }

          // Devolvemos los datos actualizados del usuario
          resolve(usuario);
        });
      });
    });
  }

  /**
   Eliminar un usuario de manera lógica (soft delete) en la base de datos
   @param {number} id - ID del usuario a eliminar
   @returns {Promise<Object>} - El usuario con el campo 'borrado' actualizado
  */
  static async eliminarUsuario(id) {
    return new Promise((resolve, reject) => {
      // 1. Actualizar el usuario
      const updateSql = `
        UPDATE users 
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
          return reject(new Error("No se encontró ningún usuario con ese ID"));
        }

        // 3. Consultar solo los datos del usuario (sin JOIN innecesario)
        const selectSql = `
          SELECT id, nombre, correo, rol_id, borrado 
          FROM users 
          WHERE id = ?
        `;

        db.get(selectSql, [id], (err, usuario) => {
          if (err) {
            return reject(err);
          }

          if (!usuario) {
            return reject(
              new Error("No se pudo recuperar el usuario eliminado"),
            );
          }

          // Devolvemos los datos actualizados del usuario
          resolve(usuario);
        });
      });
    });
  }

  /**
   Obtiene todos los usuarios
    @returns {Promise<Array<Object>>} - Lista de usuarios
  */
  static async obtenerTodosUsuarios() {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM users`;

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
