import express from "express";
import UserController from "../controllers/UserController.js";
import InscripcionesController from "../controllers/InscripcionesController.js";
import LoginController from "../controllers/LoginController.js";
import RolController from "../controllers/RolController.js";
import MateriaController from "../controllers/MateriaController.js";
import SeccionController from "../controllers/SeccionController.js";

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
rutas.get("/dashboard/admin/panel", (req, res) => {
  res.render("admin/panel", {
    title: "Panel de Administración - EduLink",
    user: "Admin",
  });
});

// Perfil
rutas.get("/admin/perfil", (req, res) => {
  res.render("admin/perfil", { 
    title: "Perfil - EduLink", 
    users: "Admin" }); 
});

// Gestionar Usuarios
rutas.get("/admin/gestionar-usuarios", (req, res) => {
  res.render("admin/gestionUsuario", {
    title: "Gestionar Usuarios - EduLink",
    user: "Admin",
    usuarios: [],
  });
});

// Gestionar Materias
rutas.get("/admin/gestionar-materias", (req, res) => {
  res.render("admin/gestionMateria", {
    title: "Gestionar Materias - EduLink",
    user: "Admin",
    semestres: [],
    materias: [],
    secciones: [],
  });
});

// Gestionar inscripciones
rutas.get("/admin/gestionar-inscripciones", (req, res) => {
  res.render("admin/gestionInscripcion", {
    title: "Gestionar Inscripciones - EduLink",
    user: "Admin",
    semestres: [], 
    solicitudes: [], 
    inscripciones: [] 
  });
});
 
// Gestionar Adicion y Retiro
rutas.get("/admin/gestionar-adicion-retiro", (req, res) => {
  res.render("admin/gestionAdicionRetiro", {
    title: "Gestionar Adición y Retiro - EduLink",
    user: "Admin",
    estudiantes: [],
    secciones: [],
    materias: [],
    semestres: [],
    solicitudes: [],
    pendientes: [],
    procesadas: [],
    inscripciones: []
  });
});

// Gestionar Actas Especiales
rutas.get("/admin/gestionar-actas-especiales", (req, res) => {
  res.render("admin/gestionActaEspecial", {
   title: "Gestión de Actas Especiales",
    user: "Admin",
    docentes: [], 
    estudiantes: [], 
    materias: [], 
    secciones: [],
    solicitudes: [], 
    procesadas: [],
    actas: []
  });
});

// Gestionar Encuestas
rutas.get("/admin/gestionar-encuestas", (req, res) => {
  res.render("admin/gestionEncuesta", {
    title: "Gestión de Encuestas",
    user: "Admin",
    semestres: [], 
    materias: [],
    encuestas: []
  });
});

//--------------Rutas Docentes------------
// Panel de inicio
rutas.get("/dashboard/docente/panel", (req, res) => {
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

//--------------Rutas Estudiantes------------
// Panel de inicio
rutas.get("/dashboard/estudiante/panel", (req, res) => {
  res.render("estudiante/panel", {
    title: "Panel de Estudiante - EduLink",
    user: "Estudiante",
    semestre: null,
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
    semestres: [], 
    materias: [],
    secciones: [],
    solicitudes: []
  });
});

// Adición y Retiro
rutas.get("/estudiante/adicion-retiro", (req, res) => {
  res.render("estudiante/adicionRetiro", {
    title: "Adición y Retiro - EduLink",
    user: "Estudiante",
    semestres: [],
    materias: [],
    secciones: [], 
    solicitudes: []
  });
}); 

// Actas Especiales
rutas.get("/estudiante/acta-especial", (req, res) => {
  res.render("estudiante/actaEspecial", {
    title: "Actas Especiales - EduLink",
    user: "Estudiante",
    actas: [] 
  });
});

// Encuestas
rutas.get("/estudiante/encuestas", (req, res) => {
  res.render("estudiante/encuestas", {
    title: "Encuestas - EduLink",
    user: "Estudiante",
    encuestas: []
  });
});

rutas.post("/api/usuarios/crear-usuario", UserController.crearUsuario);
rutas.get("/api/usuarios/todos-usuarios", UserController.todosUsuarios);
rutas.patch(
  "/api/usuarios/actualizar-usuario",
  UserController.actualizarUsuario,
);

rutas.patch("/api/usuarios/eliminar-usuario", UserController.eliminarUsuario);

rutas.post("/api/roles/crear-rol", RolController.crearRol);
rutas.get("/api/roles/todos-roles", RolController.todosRoles);

rutas.post("/api/login/iniciar-sesion", LoginController.iniciarSesion);

rutas.get("/api/materias/todas-materias", MateriaController.todasMaterias);

rutas.get("/api/secciones/todas-secciones", SeccionController.todasSecciones);
rutas.post("/api/secciones/crear-seccion", SeccionController.crearSeccion);

//API INSCRIPCIONES
rutas.post(
  "/api/inscripciones/crear-inscripcion",
  InscripcionesController.crearInscripcion,
); // estudiante_id, semestre_id, materia_id, seccion_id
//rutas.post("/api/inscripciones/gestionar-solicitud", InscripcionesController.actualizarEstadoSolicitud); // solicitud_id, estado

//API MATERIAS
//rutas.post("/api/materias/crear-seccion", MateriaController.crearSeccion); //semestre, materia_id, seccion_nombre
//rutas.patch("/api/materias/actualizar-seccion", MateriaController.actualizarSeccion); // id, nombre
//rutas.patch("/api/materias/eliminar-seccion", MateriaController.eliminarSeccion); //id

//API ADICION Y RETIRO
//rutas.post("/api/adicion-retiro/crear-adicion-retiro", AdicionRetiroController.crearAdicionRetiro);  // estudiante_id, semestre_id, materia_id, seccion_id, tipo
//rutas.patch("/api/adicion-retiro/actualizar-estado", AdicionRetiroController.actualizarAdicioRetiro); // id, estado ('Aprobada', 'Rechazada', 'Procesada').

//API ACTAS ESPECIALES
//rutas.post("/api/actas-especiales/crear-actas-especiales", ActasEspecialesController.crearActasEspeciales);  // estudiante_id, materia_id, nota, motivo
//rutas.patch("/api/actas-especiales/gestionar-actas-especiales", ActasEspecialesController.gestionarActasEspeciales); // id, accion ('Aprobar' o 'Rechazar')
//rutas.patch("/api/actas-especiales/eliminar-actas-especiales", ActasEspecialesController.eliminarActasEspeciales); // id

//API ENCUESTAS
//rutas.post("/api/encuestas/crear-encuesta", EncuestasController.crearEncuestas); // titulo, descripcion, semestre, fecha_inicio, fecha_fin, materias id (para el array q muestra las materias a seleccionar)
//rutas.patch("/api/encuestas/actualizar-encuestas", EncuestasController.actualizarEncuestas); // id, titulo, descripcion, semestre, fecha_inicio, fecha_fin, estado, materias id (para el array q muestra las materias a seleccionar)
//rutas.patch("/api/encuestas/eliminar-encuesta", EncuestasController.eliminarEncuestas); //id

export default rutas;
