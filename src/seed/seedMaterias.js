import { db } from "../config/database.js";

export const seedDefaultMaterias = () => {
  // Crear materias por defecto
  const materias = [
    { nombre: "Fundamentos de la Informática", semestre: 1, usuario_id: 1 },
    { nombre: "Deporte", semestre: 1, usuario_id: 1 },
    { nombre: "Matemática I", semestre: 1, usuario_id: 1 },
    { nombre: "Lógica Matemática", semestre: 1, usuario_id: 1 },
    { nombre: "Formación Constitucional", semestre: 1, usuario_id: 1 },
    { nombre: "Lenguaje y Comunicación", semestre: 1, usuario_id: 1 },
    { nombre: "Inglés I", semestre: 1, usuario_id: 1 },
    { nombre: "Economía Digital", semestre: 1, usuario_id: 1 },
    { nombre: "Matemática II", semestre: 2, usuario_id: 1 },
    {
      nombre: "Problemática Científica y Tecnológica",
      semestre: 2,
      usuario_id: 1,
    },
    { nombre: "Física I", semestre: 2, usuario_id: 1 },
    { nombre: "Electiva I (Conducta Humana)", semestre: 2, usuario_id: 1 },
    { nombre: "Algoritmos I", semestre: 2, usuario_id: 1 },
    { nombre: "Arte y Cultura", semestre: 2, usuario_id: 1 },
    { nombre: "Inglés II", semestre: 2, usuario_id: 1 },
    { nombre: "Algoritmos II", semestre: 3, usuario_id: 1 },
    {
      nombre: "Electiva II (Legislación Informática)",
      semestre: 3,
      usuario_id: 1,
    },
    { nombre: "Programación I", semestre: 3, usuario_id: 1 },
    { nombre: "Matemática III", semestre: 3, usuario_id: 1 },
    { nombre: "Física II", semestre: 3, usuario_id: 1 },
    {
      nombre: "Metodología y Técnicas de Investigación",
      semestre: 3,
      usuario_id: 1,
    },
    { nombre: "Probabilidades y Estadística", semestre: 4, usuario_id: 1 },
    { nombre: "Matemática IV", semestre: 4, usuario_id: 1 },
    { nombre: "Programación II", semestre: 4, usuario_id: 1 },
    {
      nombre: "Electiva III (Mantenimiento del Computador)",
      semestre: 4,
      usuario_id: 1,
    },
    { nombre: "Estructuras Discretas I", semestre: 4, usuario_id: 1 },
    { nombre: "Base de Datos", semestre: 4, usuario_id: 1 },
    { nombre: "Teoría de Sistemas", semestre: 5, usuario_id: 1 },
    { nombre: "Álgebra Booleana", semestre: 5, usuario_id: 1 },
    { nombre: "Estructuras Discretas II", semestre: 5, usuario_id: 1 },
    { nombre: "Programación III", semestre: 5, usuario_id: 1 },
    { nombre: "Electiva IV (Teleinformática)", semestre: 5, usuario_id: 1 },
    { nombre: "Organización del Computador", semestre: 5, usuario_id: 1 },
    { nombre: "Investigación de Operaciones", semestre: 6, usuario_id: 1 },
    { nombre: "Arquitectura del Computador", semestre: 6, usuario_id: 1 },
    { nombre: "Sistemas de Información I", semestre: 6, usuario_id: 1 },
    { nombre: "Métodos Numéricos", semestre: 6, usuario_id: 1 },
    { nombre: "Ingeniería Económica", semestre: 6, usuario_id: 1 },
    { nombre: "Electiva V", semestre: 6, usuario_id: 1 },
    {
      nombre: "Organización y Gestión de Empresas",
      semestre: 7,
      usuario_id: 1,
    },
    { nombre: "Traductores e Intérpretes", semestre: 7, usuario_id: 1 },
    { nombre: "Sistemas Operativos", semestre: 7, usuario_id: 1 },
    { nombre: "Sistemas de Información II", semestre: 7, usuario_id: 1 },
    { nombre: "Control de Proyectos", semestre: 7, usuario_id: 1 },
    { nombre: "Electiva de Área I", semestre: 8, usuario_id: 1 },
    { nombre: "Pasantía", semestre: 8, usuario_id: 1 },
    { nombre: "Lenguaje de Programación", semestre: 8, usuario_id: 1 },
    { nombre: "Sistemas de Información III", semestre: 8, usuario_id: 1 },
    { nombre: "Redes", semestre: 8, usuario_id: 1 },
    { nombre: "Electiva Libre I", semestre: 9, usuario_id: 1 },
    { nombre: "Sistemas Distribuidos", semestre: 9, usuario_id: 1 },
    { nombre: "Electiva de Área II", semestre: 9, usuario_id: 1 },
    { nombre: "Ética Profesional", semestre: 9, usuario_id: 1 },
    { nombre: "Proyecto de Grado I", semestre: 9, usuario_id: 1 },
    { nombre: "Electiva de Área III", semestre: 10, usuario_id: 1 },
    { nombre: "Electiva Libre II", semestre: 10, usuario_id: 1 },
    { nombre: "Proyecto de Grado II", semestre: 10, usuario_id: 1 },
    { nombre: "Informática Educativa", semestre: 10, usuario_id: 1 },
    { nombre: "Gerencia de Proyectos", semestre: 10, usuario_id: 1 },
  ];

  // Usar transacción para mejor rendimiento
  db.serialize(() => {
    db.run("BEGIN TRANSACTION");

    materias.forEach((materia) => {
      const sql = `INSERT OR IGNORE INTO materias (nombre, semestre, usuario_id) VALUES (?, ?, ?)`;
      db.run(
        sql,
        [materia.nombre, materia.semestre, materia.usuario_id],
        (err) => {
          if (err) {
            console.error(
              `Error al insertar materia ${materia.nombre}:`,
              err.message,
            );
          }
        },
      );
    });

    db.run("COMMIT", (err) => {
      if (err) {
        console.error("Error al hacer commit:", err.message);
      } else {
        console.log(
          `${materias.length} materias por defecto creadas o ya existían.`,
        );
      }
    });
  });
};

seedDefaultMaterias();
