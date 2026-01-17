import express from "express";
import UserController from "../controllers/UserController.js";
import InscripcionesController from "../controllers/InscripcionesController.js";

const rutas = express.Router();

rutas.get("/", (req, res) => {
  res.render("index", { title: "Inicio - EduLink", user: null });
});

//----------Rutas de Partials------
// layout
rutas.get("/partials/layout", (req, res) => {
  res.render("partials/layout");
});

// Header
rutas.get("/partials/header", (req, res) => {
  res.render("partials/header");
});

// Footer
rutas.get("/partials/footer", (req, res) => {
  res.render("partials/footer");
});

//----------Rutas de Autenticación------
// Registro de Usuario
rutas.get("/registro-usuario", (req, res) => {
  res.render("auth/registro", {
    title: "Registro de Usuario - EduLink",
    user: null,
  });
});

// login de Usuario
rutas.get("/login", (req, res) => {
  res.render("auth/login", { title: "Login - EduLink", user: null });
});

//--------------Rutas Admin-------------
// Panel de inicio
rutas.get("/admin/panel", (req, res) => {
  res.render("admin/panel", {
    title: "Panel de Administración - EduLink",
    user: "Admin",
  });
});

// Perfil
rutas.get("/admin/perfil", (req, res) => {
  res.render("admin/perfil", { title: "Perfil - EduLink", user: "Admin" });
});

// Gestionar Usuarios
rutas.get("/admin/gestionar-usuarios", (req, res) => {
  res.render("admin/gestionar-usuarios", {
    title: "Gestionar Usuarios - EduLink",
    user: "Admin",
  });
});

// Gestionar Materias
rutas.get("/admin/gestionar-materias", (req, res) => {
  res.render("admin/gestionar-materias", {
    title: "Gestionar Materias - EduLink",
    user: "Admin",
  });
});

// Gestionar inscripciones
rutas.get("/admin/gestionar-inscripciones", (req, res) => {
  res.render("admin/gestionar-inscripciones", {
    title: "Gestionar Inscripciones - EduLink",
    user: "Admin",
  });
});

// Gestionar Adicion y Retiro
rutas.get("/admin/gestionar-adicion-retiro", (req, res) => {
  res.render("admin/gestionar-adicion-retiro", {
    title: "Gestionar Adición y Retiro - EduLink",
    user: "Admin",
  });
});

// Gestionar Actas Especiales
rutas.get("/admin/gestionar-actas-especiales", (req, res) => {
  res.render("admin/gestionar-actas-especiales", {
    title: "Gestionar Actas Especiales - EduLink",
    user: "Admin",
  });
});

// Gestionar Encuestas
rutas.get("/admin/gestionar-encuestas", (req, res) => {
  res.render("admin/gestionar-encuestas", {
    title: "Gestionar Encuestas - EduLink",
    user: "Admin",
  });
});

//--------------Rutas Estudiantes------------
// Panel de inicio
rutas.get("/estudiante/panel", (req, res) => {
  res.render("estudiante/panel", {
    title: "Panel de Estudiante - EduLink",
    user: "Estudiante",
  });
});

// Perfil
rutas.get("/estudiante/perfil", (req, res) => {
  res.render("estudiante/perfil", {
    title: "Perfil - EduLink",
    user: "Estudiante",
  });
});

// inscripcion
rutas.get("/estudiante/inscripcion", (req, res) => {
  res.render("estudiante/inscripcion", {
    title: "Inscripción - EduLink",
    user: "Estudiante",
  });
});

// Adición y Retiro
rutas.get("/estudiante/adicion-retiro", (req, res) => {
  res.render("estudiante/adicion-retiro", {
    title: "Adición y Retiro - EduLink",
    user: "Estudiante",
  });
});

// Actas Especiales
rutas.get("/estudiante/actas-especiales", (req, res) => {
  res.render("estudiante/actas-especiales", {
    title: "Actas Especiales - EduLink",
    user: "Estudiante",
  });
});

// Encuestas
rutas.get("/estudiante/encuestas", (req, res) => {
  res.render("estudiante/encuestas", {
    title: "Encuestas - EduLink",
    user: "Estudiante",
  });
});

//--------------Rutas Docentes------------
// Panel de inicio
rutas.get("/docente/panel", (req, res) => {
  res.render("docente/panel", {
    title: "Panel de Docente - EduLink",
    user: "Docente",
  });
});

// Perfil
rutas.get("/docente/perfil", (req, res) => {
  res.render("docente/perfil", { title: "Perfil - EduLink", user: "Docente" });
});

// Gestionar Actas Especiales
rutas.get("/docente/gestionar-actas-especiales", (req, res) => {
  res.render("docente/gestionar-actas-especiales", {
    title: "Gestionar Actas Especiales - EduLink",
    user: "Docente",
  });
});

rutas.post("/api/usuarios/crear-usuario", UserController.crearUsuario);
rutas.post("/api/inscripciones/crear-inscripcion", InscripcionesController.crearInscripcion);

export default rutas;
