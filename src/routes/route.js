import express from "express";
import UserController from "../controllers/UserController.js";
import LoginController from "../controllers/LoginController.js";
import RolController from "../controllers/RolController.js";
import MateriaController from "../controllers/MateriaController.js";
import SeccionController from "../controllers/SeccionController.js";
import InscripcionController from "../controllers/InscripcionController.js";
import { AdicionRetiroController } from "../controllers/AdicionRetiroController.js";
import {
  adminLimiter,
  busquedaLimiter,
  gestionLimiter,
  inscripcionLimiter,
  loginLimiter,
  readLimiter,
  writeLimiter,
} from "../middlewares/rateLimited.js";
import AuthMiddleware from "../middlewares/authMiddleware.js";
import { ActasEspecialesController } from "../controllers/ActasEspecialesController.js";
import EncuestasController from "../controllers/EncuestasController.js";

const rutas = express.Router();

rutas.get("/", (req, res) => {
  res.render("index", { title: "Inicio - EduLink", user: null });
});

rutas.get("/ayuda", (req, res) => {
  res.render("ayuda", {
    title: "Centro de Ayuda - EduLink", // <--- Asegúrate de que esta línea exista
    user: req.user || null,
  });
});

rutas.get("/no-autorizado", (req, res) => {
  res.render("noAutorizado", {
    title: "Usuario no autorizado - EduLink",
  });
});

/*rutas.get("/perfil", (req, res) => {
  res.render("perfil", {
    title: "Usuario perfil - EduLink",
  });
});**/
rutas.get('/perfil', (req, res) => {
    const datosUsuario = req.session?.user || {}; 

    res.render('perfil', { 
        title: 'Mi Perfil - EduLink',
        paginaActual: 'perfil',
        users: datosUsuario ,
        user: "Usuarios",
              
    });
})


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
rutas.get(
  "/dashboard/admin/panel",
  AuthMiddleware.authenticado,
  AuthMiddleware.soloAdmin,
  (req, res) => {
    res.render("admin/panel", {
      title: "Panel de Administración - EduLink",
      user: "Admin",
    });
  },
);



// Gestionar Usuarios
rutas.get(
  "/admin/gestionar-usuarios",
  AuthMiddleware.authenticado,
  AuthMiddleware.soloAdmin,
  (req, res) => {
    res.render("admin/gestionUsuario", {
      title: "Gestionar Usuarios - EduLink",
      user: "Admin",
      usuarios: [],
    });
  },
);

// Gestionar Materias
rutas.get(
  "/admin/gestionar-materias",
  AuthMiddleware.authenticado,
  AuthMiddleware.soloAdmin,
  (req, res) => {
    res.render("admin/gestionMateria", {
      title: "Gestionar Materias - EduLink",
      user: "Admin",
      semestres: [],
      materias: [],
      secciones: [],
    });
  },
);

// Gestionar inscripciones
rutas.get(
  "/admin/gestionar-inscripciones",
  AuthMiddleware.authenticado,
  AuthMiddleware.soloAdmin,
  (req, res) => {
    res.render("admin/gestionInscripcion", {
      title: "Gestionar Inscripciones - EduLink",
      user: "Admin",
      semestres: [],
      solicitudes: [],
      inscripciones: [],
    });
  },
);

// Gestionar Adicion y Retiro
rutas.get(
  "/admin/gestionar-adicion-retiro",
  AuthMiddleware.authenticado,
  AuthMiddleware.soloAdmin,
  (req, res) => {
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
      inscripciones: [],
    });
  },
);

// Gestionar Actas Especiales
rutas.get(
  "/admin/gestionar-actas-especiales",
  AuthMiddleware.authenticado,
  AuthMiddleware.soloAdmin,
  (req, res) => {
    res.render("admin/gestionActaEspecial", {
      title: "Gestión de Actas Especiales",
      user: "Admin",
      docentes: [],
      estudiantes: [],
      materias: [],
      secciones: [],
      solicitudes: [],
      procesadas: [],
      actas: [],
    });
  },
);

// Gestionar Encuestas
rutas.get(
  "/admin/gestionar-encuestas",
  AuthMiddleware.authenticado,
  AuthMiddleware.soloAdmin,
  (req, res) => {
    res.render("admin/gestionEncuesta", {
      title: "Gestión de Encuestas",
      user: "Admin",
      semestres: [],
      materias: [],
      encuestas: [],
    });
  },
);

//--------------Rutas Docentes------------
// Panel de inicio
rutas.get(
  "/dashboard/docente/panel",
  AuthMiddleware.authenticado,
  AuthMiddleware.soloProfesor,
  (req, res) => {
    res.render("docente/panel", {
      title: "Panel de Docente - EduLink",
      user: "Docente",
    });
  },
);



// Gestionar Actas Especiales
rutas.get(
  "/docente/gestionar-acta-especial",
  AuthMiddleware.authenticado,
  AuthMiddleware.soloProfesor,
  (req, res) => {
    res.render("docente/gestionarActaEspecial", {
      title: "Gestionar Actas Especiales - EduLink",
      user: "Docente",
      estudiantes: [],
      materias: [],
      secciones: [],
      actas: [],
    });
  },
);

// Gestionar Actas Especiales
rutas.get(
  "/admin/gestionar-actas-especiales",
  AuthMiddleware.authenticado,
  AuthMiddleware.soloAdmin,
  (req, res) => {
    res.render("admin/gestionActaEspecial", {
      title: "Gestión de Actas Especiales",
      user: "Admin",
      docentes: [],
      estudiantes: [],
      materias: [],
      secciones: [],
      solicitudes: [],
      procesadas: [],
      actas: [],
    });
  },
);

// Actas Especiales
rutas.get(
  "/estudiante/acta-especial",
  AuthMiddleware.authenticado,
  AuthMiddleware.soloAlumno,
  (req, res) => {
    res.render("estudiante/actaEspecial", {
      title: "Actas Especiales - EduLink",
      user: "Estudiante",
      actas: [],
    });
  },
);

//--------------Rutas Estudiantes------------
// Panel de inicio
rutas.get(
  "/dashboard/estudiante/panel",
  AuthMiddleware.authenticado,
  AuthMiddleware.soloAlumno,
  (req, res) => {
    res.render("estudiante/panel", {
      title: "Panel de Estudiante - EduLink",
      user: "Estudiante",
      semestre: null,
    });
  },
);


// inscripcion
rutas.get(
  "/estudiante/inscripcion",
  AuthMiddleware.authenticado,
  AuthMiddleware.soloAlumno,
  (req, res) => {
    res.render("estudiante/inscripcions", {
      title: "Inscripción - EduLink",
      user: usuario,
      semestres: [],
      materias: [],
      secciones: [],
      solicitudes: [],
    });
  },
);

// Adición y Retiro
rutas.get(
  "/estudiante/adicion-retiro",
  AuthMiddleware.authenticado,
  AuthMiddleware.soloAlumno,
  (req, res) => {
    res.render("estudiante/adicionRetiro", {
      title: "Adición y Retiro - EduLink",
      user: "Estudiante",
      semestres: [],
      materias: [],
      secciones: [],
      solicitudes: [],
    });
  },
);

// Encuestas
rutas.get(
  "/estudiante/encuestas",
  AuthMiddleware.authenticado,
  AuthMiddleware.soloAlumno,
  (req, res) => {
    res.render("estudiante/encuestas", {
      title: "Encuestas - EduLink",
      user: "Estudiante",
      encuestas: [],
    });
  },
);

// Rutas de api
rutas.post(
  "/api/usuarios/crear-usuario",
  adminLimiter,
  UserController.crearUsuario,
);

rutas.get(
  "/api/usuarios/todos-usuarios",
  readLimiter,
  UserController.todosUsuarios,
);

rutas.patch(
  "/api/usuarios/actualizar-usuario",
  adminLimiter,
  UserController.actualizarUsuario,
);

rutas.patch(
  "/api/usuarios/eliminar-usuario",
  adminLimiter,
  UserController.eliminarUsuario,
);

rutas.post("/api/roles/crear-rol", adminLimiter, RolController.crearRol);

rutas.get("/api/roles/todos-roles", readLimiter, RolController.todosRoles);

rutas.post(
  "/api/login/iniciar-sesion",
  loginLimiter,
  LoginController.iniciarSesion,
);

rutas.get("/api/login/cerrar-sesion", LoginController.logout);

rutas.get(
  "/api/materias/todas-materias",
  readLimiter,
  MateriaController.todasMaterias,
);

rutas.post(
  "/api/secciones/crear-seccion",
  writeLimiter,
  SeccionController.crearSeccion,
);

rutas.get(
  "/api/secciones/todas-secciones",
  readLimiter,
  SeccionController.todasSecciones,
);

rutas.patch(
  "/api/secciones/actualizar-seccion",
  writeLimiter,
  SeccionController.actualizarSeccion,
);
rutas.patch(
  "/api/secciones/eliminar-seccion",
  writeLimiter,
  SeccionController.eliminarSeccion,
);

//API INSCRIPCIONES
rutas.post(
  "/api/inscripcion/crear-inscripcion",
  inscripcionLimiter,
  InscripcionController.crearInscripcion,
);
rutas.post(
  "/api/inscripcion/gestionar/:id",
  gestionLimiter,
  InscripcionController.gestionarSolicitud,
);

rutas.post(
  "/api/inscripcion/buscar-estudiante",
  busquedaLimiter,
  UserController.buscarUsuarioCedula,
);

rutas.get(
  "/api/inscripcion/confirmadas",
  readLimiter,
  InscripcionController.listarConfirmadas,
);
rutas.get(
  "/api/inscripcion/semestres",
  readLimiter,
  InscripcionController.listarSemestres,
);
rutas.get(
  "/api/inscripcion/materias",
  readLimiter,
  InscripcionController.listarMaterias,
);
rutas.get(
  "/api/inscripcion/secciones",
  readLimiter,
  InscripcionController.listarSecciones,
);

rutas.post(
  "/api/inscripciones/solicitar-inscripcion",
  inscripcionLimiter,
  InscripcionController.solicitarInscripcion,
);

rutas.post(
  "/api/adicion-retiro/buscar-estudiante",
  busquedaLimiter,
  UserController.buscarUsuarioCedula,
);
rutas.post(
  "/api/adicion-retiro/crear-adicion-retiro",
  inscripcionLimiter,
  AdicionRetiroController.crearAdicionRetiro,
);

rutas.get(
  "/api/adicion-retiro/semestres",
  readLimiter,
  AdicionRetiroController.listarSemestres,
);
rutas.get(
  "/api/adicion-retiro/materias",
  readLimiter,
  AdicionRetiroController.listarMaterias,
);
rutas.get(
  "/api/adicion-retiro/secciones",
  readLimiter,
  AdicionRetiroController.listarSecciones,
);
rutas.get(
  "/api/adicion-retiro/listar-procesadas",
  readLimiter,
  AdicionRetiroController.listarProcesadas,
);

rutas.patch(
  "/api/adicion-retiro/actualizar-estado",
  gestionLimiter,
  AdicionRetiroController.actualizarEstado,
);
rutas.patch(
  "/api/adicion-retiro/eliminar",
  adminLimiter,
  AdicionRetiroController.eliminar,
);

rutas.post(
  "/api/actas-especiales/crear-acta-especial",
  adminLimiter,
  ActasEspecialesController.crearActaEspecial,
);

rutas.get(
  "/api/actas-especiales/obtener-docentes",
  adminLimiter,
  ActasEspecialesController.obtenerDocentes,
);
rutas.get(
  "/api/actas-especiales/obtener-estudiantes",
  adminLimiter,
  ActasEspecialesController.obtenerEstudiantes,
);
rutas.get(
  "/api/actas-especiales/listar-actas",
  adminLimiter,
  ActasEspecialesController.listarActas,
);

rutas.get(
  "/api/encuestas/obtener-semestres",
  EncuestasController.listarSemestres,
);
rutas.get(
  "/api/encuestas/listar-materias",
  EncuestasController.listarMateriasPorSemestre,
);
// API para la tabla y selects del Admin
rutas.get(
  "/api/encuestas/listar-encuestas",
  EncuestasController.listarEncuestas,
);
rutas.get(
  "/api/encuestas/obtener-semestres",
  EncuestasController.listarSemestres,
);
rutas.get(
  "/api/encuestas/listar-materias",
  EncuestasController.listarMateriasPorSemestre,
);

rutas.get(
    "/api/perfil/obtener-usuario", 
    AuthMiddleware.authenticado, // <--- ESTO ES LO QUE CREA req.authData
    UserController.obtenerDatosDeUsuario
);

// Acciones de CRUD (Admin)
rutas.post("/api/encuestas/crear-encuesta", EncuestasController.crearEncuesta);
rutas.patch(
  "/api/encuestas/actualizar-encuesta",
  EncuestasController.actualizarEncuesta,
);
rutas.patch(
  "/api/encuestas/eliminar-encuesta",
  EncuestasController.eliminarEncuesta,
);

rutas.get("/api/encuestas/obtener/:id", EncuestasController.obtenerPorId);

// Vista de encuestas disponibles para el estudiante
rutas.get("/estudiante/encuestas", EncuestasController.vistaEstudiante);

// Acción de votar (Recibe encuestaId por URL y materias por Body)
rutas.post("/api/encuestas/votar/:encuestaId", EncuestasController.votar);

export default rutas;
