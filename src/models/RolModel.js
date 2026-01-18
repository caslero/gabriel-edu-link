import { db } from "../config/database.js";

export class RolModel {
  /**
   Crea un nuevo rol en la base de datos
   @param {Object} datos - Objeto con nombre
   @returns {Promise<Object>} - El rol creado incluyendo su nuevo ID
  */
  static async crearRol(datos) {
    return new Promise((resolve, reject) => {
      // 1. Preparamos la sentencia SQL
      // Nota: Asegúrate de que los nombres de columnas coincidan con tu tabla
      const sql = `
      INSERT INTO roles (nombre) 
      VALUES (?)
    `;

      const params = [datos.nombre];

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
   Busca un rol por su nombre
   @param {string} nombre - El nombre a buscar
   @returns {Promise<Object|null>} - El rol encontrado o null
  */
  static async buscarUsuarioPorNombre(nombre) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM roles WHERE nombre = ? LIMIT 1`;

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
   Obtiene todos los roles
    @returns {Promise<Array<Object>>} - Lista de roles
  */
  static async obtenerTodosLosRoles() {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM roles`;

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
