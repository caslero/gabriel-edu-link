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