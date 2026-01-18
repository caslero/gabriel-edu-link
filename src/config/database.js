import "dotenv/config"; // para leer variables de entorno
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
  console.log(`Carpeta creada: ${dbDir}`);
}

// Conectar/crear archivo SQLite
export const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error al conectar a la base de datos:", err.message);
  } else {
    //console.log(`Conectado a la base de datos SQLite en: ${dbPath}`);
    console.log(`Base de datos conectada`);
  }
});

// Inicializar tabla roles (solo estructura)
export const initRolesTable = () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS roles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL UNIQUE,
      borrado BOOLEAN NOT NULL DEFAULT 0,              -- 0 = activo, 1 = borrado
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `;
  db.run(sql, (err) => {
    if (err) {
      console.error("Error al crear tabla roles:", err.message);
    } else {
      console.log("Tabla roles creada o ya existe.");
    }
  });
};

// Inicializar tabla users con relación a roles
export const initUsersTable = () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cedula TEXT NOT NULL UNIQUE,
    nombre TEXT NOT NULL,
    correo TEXT NOT NULL UNIQUE,
    clave TEXT NOT NULL,
    pais BOOLEAN NOT NULL CHECK (pais IN (0,1)), -- 1 = venezolano, 0 = extranjero
    rol_id INTEGER NOT NULL,
    foto TEXT,
    token TEXT NOT NULL UNIQUE CHECK (LENGTH(token) == 16),
    borrado BOOLEAN NOT NULL DEFAULT 0,          -- 0 = activo, 1 = borrado
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (rol_id) REFERENCES roles(id)
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

export const initDatabase = () => {
  initRolesTable();
  initUsersTable();
};

/**
import "dotenv/config"; // para leer variables de entorno
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
  console.log(`Carpeta creada: ${dbDir}`);
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
      pais TEXT NOT NULL CHECK (LENGTH(pais) == 1),
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
 */

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
