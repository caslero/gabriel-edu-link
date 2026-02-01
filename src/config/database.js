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

// Inicializar tabla materias
export const initMateriasTable = () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS materias (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      semestre INTEGER NOT NULL,
      usuario_id INTEGER NOT NULL,            -- Usuario que creó la materia
      borrado BOOLEAN NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (usuario_id) REFERENCES users(id)
    );
  `;
  db.run(sql, (err) => {
    if (err) {
      console.error("Error al crear tabla materias:", err.message);
    } else {
      console.log("Tabla materias con usuario_id creada.");
    }
  });
};

// Inicializar tabla secciones
export const initSeccionesTable = () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS secciones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      materia_id INTEGER NOT NULL,
      seccion_nombre TEXT NOT NULL,
      cupos INTEGER NOT NULL DEFAULT 0, 
      usuario_id INTEGER NOT NULL,            -- Usuario que creó la sección
      borrado BOOLEAN NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (materia_id) REFERENCES materias(id) ON DELETE CASCADE,
      FOREIGN KEY (usuario_id) REFERENCES users(id)
      UNIQUE(materia_id, seccion_nombre)
    );
  `;
  db.run(sql, (err) => {
    if (err) {
      console.error("Error al crear tabla secciones:", err.message);
    } else {
      console.log("Tabla secciones con usuario_id creada.");
    }
  });
};

  export const initInscripcionesTable = () => {
    const sql = `
      CREATE TABLE IF NOT EXISTS inscripciones (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        estudiante_id INTEGER NOT NULL,          
        seccion_id INTEGER NOT NULL,            
        usuario_id INTEGER NOT NULL,             
        estado TEXT NOT NULL 
          CHECK (estado IN ('Pendiente', 'Aprobada', 'Rechazada')) DEFAULT 'Pendiente',
        comentario TEXT,                        
        gestionado_por INTEGER,                  
        borrado BOOLEAN NOT NULL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (estudiante_id) REFERENCES users(id),
        FOREIGN KEY (seccion_id) REFERENCES secciones(id) ON DELETE CASCADE,
        FOREIGN KEY (usuario_id) REFERENCES users(id),
        FOREIGN KEY (gestionado_por) REFERENCES users(id)
      );
    `;
    db.run(sql, (err) => {
      if (err) {
        console.error("Error al crear tabla inscripciones:", err.message);
      } else {
        console.log("Tabla inscripciones creada.");
      }
    });
  };

  
  export const initAdicionRetiroTable = () => {
    const sql = `
          CREATE TABLE IF NOT EXISTS adicion_retiro (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            estudiante_id INTEGER NOT NULL,
            seccion_id INTEGER NOT NULL,
            tipo TEXT NOT NULL CHECK (tipo IN ('Adicion', 'Retiro')),
            estado TEXT NOT NULL CHECK (estado IN ('Pendiente', 'Aprobada', 'Rechazada')) DEFAULT 'Pendiente',
            fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
            borrado BOOLEAN NOT NULL DEFAULT 0,
            FOREIGN KEY (estudiante_id) REFERENCES users(id), -- Ajustado a 'id' de tu tabla users
            FOREIGN KEY (seccion_id) REFERENCES secciones(id) ON DELETE CASCADE
          );
        `;
        db.run(sql, (err) => {
      if (err) {
        console.error("Error al crear tabla adicion_retiro:", err.message);
      } else {
        console.log("Tabla adicion_retiro creada.");
      }
    });
  };


  export const initActasEspecialesTable = () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS actas_especiales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo TEXT NOT NULL,
      descripcion TEXT,
      tipo TEXT NOT NULL CHECK (tipo IN ('Solicitud', 'Acta Directa')),
      docente_id INTEGER NOT NULL,      -- El docente asignado
      estudiante_id INTEGER,           -- Estudiante (puede ser NULL si es acta general)
      creado_por INTEGER,              -- ID del admin/usuario que creó el registro
      estado TEXT NOT NULL DEFAULT 'Pendiente' 
        CHECK (estado IN ('Pendiente', 'Procesada', 'Anulada')),
      fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
      borrado BOOLEAN NOT NULL DEFAULT 0,
      FOREIGN KEY (docente_id) REFERENCES users(id),
      FOREIGN KEY (estudiante_id) REFERENCES users(id),
      FOREIGN KEY (creado_por) REFERENCES users(id)
    );
  `;

  db.run(sql, (err) => {
    if (err) {
      console.error("Error al crear tabla actas_especiales:", err.message);
    } else {
      console.log("Tabla actas_especiales creada.");
    }
  });
};

export const initDatabase = () => {
  initRolesTable();
  initUsersTable();
  initMateriasTable();
  initSeccionesTable();
  initInscripcionesTable();
  initAdicionRetiroTable();
  initActasEspecialesTable();
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
