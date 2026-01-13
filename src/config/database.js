import "dotenv/config"; // 👈 para leer variables de entorno
import sqlite3 from "sqlite3";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Usa la variable de entorno o un valor por defecto
const dbPath = process.env.DB_PATH
  ? path.resolve(process.env.DB_PATH)
  : path.join(__dirname, "..", "database.db");

// Asegurar que la carpeta existe
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
  console.log(`📂 Carpeta creada: ${dbDir}`);
}

// Conectar/crear archivo SQLite
export const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error al conectar a la base de datos:", err.message);
  } else {
    console.log(`Conectado a la base de datos SQLite en: ${dbPath}`);
  }
});

// Inicializar tabla users
export const initDatabase = () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT UNIQUE NOT NULL,
      correo TEXT UNIQUE NOT NULL,
      clave TEXT NOT NULL,
      cedula TEXT NOT NULL,
      rol TEXT NOT NULL 
        CHECK (rol IN ('Admin', 'Docente', 'Estudiante')) DEFAULT 'Estudiante',
      foto TEXT,
      token TEXT NOT NULL CHECK (LENGTH(token) == 16),
      borrado TEXT NOT NULL 
        CHECK (borrado IN ('true', 'false')) DEFAULT 'false',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `;
  db.run(sql, (err) => {
    if (err) {
      console.error("Error al crear tabla users:", err.message);
    } else {
      console.log("Tabla users creada o ya existe.");
    }
  });
};
// import sqlite3 from 'sqlite3';
// import path from 'path';
// import { fileURLToPath } from 'url';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const dbPath = path.join(__dirname, '..', 'database.db');

// export const db = new sqlite3.Database(dbPath, (err) => {
//   if (err) {
//     console.error('Error al conectar a la base de datos:', err.message);
//   } else {
//     console.log('Conectado a la base de datos SQLite.');
//   }
// });

// export const initDatabase = () => {
//   const sql = `
//     CREATE TABLE IF NOT EXISTS users (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       username TEXT UNIQUE NOT NULL,
//       email TEXT UNIQUE NOT NULL,
//       password TEXT NOT NULL,
//       created_at DATETIME DEFAULT CURRENT_TIMESTAMP
//     );
//   `;
//   db.run(sql, (err) => {
//     if (err) {
//       console.error('Error al crear tabla users:', err.message);
//     } else {
//       console.log('Tabla users creada o ya existe.');
//     }
//   });
// };
