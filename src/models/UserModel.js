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
      INSERT INTO usuarios (cedula, nombre, correo, clave, rol, texto, token, borrado) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

      const params = [
        datos.cedula,
        datos.nombre,
        datos.correo,
        datos.clave,
        datos.token,
        datos.borrado,
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
}
