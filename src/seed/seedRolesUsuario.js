import { db } from "../config/database.js";

export const seedRolesAndDefaultUser = () => {
  // Insertar roles iniciales
  const insertRolesSql = `
    INSERT OR IGNORE INTO roles (id, nombre) VALUES
      (1, 'admin'),
      (2, 'docente'),
      (3, 'estudiante');
  `;
  db.run(insertRolesSql, (err) => {
    if (err) {
      console.error("Error al insertar roles:", err.message);
    } else {
      console.log("Roles iniciales insertados.");
    }
  });

  // Crear usuario por defecto (ejemplo: Admin)
  const insertUserSql = `
    INSERT OR IGNORE INTO users 
      (cedula, nombre, correo, clave, pais, rol_id, foto, token) 
    VALUES 
      ('12345678', 'administrador', 'admin@gmail.com', '$2a$05$029a1Dus7qStop21IuIKCOgGtrge/F6LvDwGgb9pnxz5/uqEQ3MU.', 1, 1, NULL, 'cs9vot27ih0vm4tb');
  `;
  db.run(insertUserSql, (err) => {
    if (err) {
      console.error("Error al insertar usuario por defecto:", err.message);
    } else {
      console.log("Usuario por defecto creado.");
    }
  });
};
