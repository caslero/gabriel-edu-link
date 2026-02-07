import { UserModel } from "../models/UserModel.js";
import validarActualizarUsuario from "../services/usuarios/validarActualizarUsuario.js";
import validarBuscarUsuarioCedula from "../services/usuarios/validarBuscarUsuarioCedula.js";
import validarCrearUsuario from "../services/usuarios/validarCrearUsuario.js";
import validarEliminarUsuario from "../services/usuarios/validarEliminarUsuario.js";
import validarObtenerTodosUsuarios from "../services/usuarios/validarObtenerTodosUsuarios.js";
import { respuestaAlFront } from "../utils/respuestaAlFront.js";

export default class UserController {
  static async crearUsuario(req, res) {
    try {
      const {
        cedula,
        nombre,
        correo,
        clave,
        confirmarClave,
        rol,
        texto,
        pais,
      } = req.body;

      //Esta colocado el 3 q es la representacion del rol

      const validaciones = await validarCrearUsuario(
        cedula,
        nombre,
        correo,
        clave,
        confirmarClave,
        rol ? rol : 3,
        texto,
        pais === "v" ? 1 : 0,
      );

      if (validaciones.status === "error") {
        return respuestaAlFront(
          res,
          validaciones.status,
          validaciones.message,
          {},
          validaciones.codigo ? validaciones.codigo : 400,
        );
      }

      const creandoUsuario = await UserModel.crearUsuario({
        cedula: validaciones.cedula,
        nombre: validaciones.nombre,
        correo: validaciones.correo,
        clave: validaciones.claveEncriptada,
        rol_id: validaciones.id_rol,
        texto: validaciones.pathImg,
        pais: validaciones.pais === 1 ? true : false,
        token: validaciones.token,
        borrado: validaciones.borrado,
      });

      if (!creandoUsuario) {
        return respuestaAlFront(
          res,
          "error",
          "Error al crear usuario",
          {},
          400,
        );
      }

      return respuestaAlFront(
        res,
        "ok",
        "Usuario creado con exito",
        {
          redirect: "/login",
        },
        201,
      );
    } catch (error) {
      console.error("Error interno crear usuario:", error);

      return respuestaAlFront(
        res,
        "error",
        "Error interno crear usuario",
        {},
        500,
      );
    }
  }

  static async todosUsuarios(req, res) {
    try {
      const validaciones = await validarObtenerTodosUsuarios(req);

      if (validaciones.status === "error") {
        return respuestaAlFront(
          res,
          validaciones.status,
          validaciones.message,
          {},
          validaciones.codigo ? validaciones.codigo : 400,
        );
      }

      const todosUsuarios = await UserModel.obtenerTodosUsuarios();

      if (!todosUsuarios) {
        return respuestaAlFront(
          res,
          "error",
          "Error al obtener todos los usuarios",
          {},
          400,
        );
      }

      return respuestaAlFront(
        res,
        "ok",
        "Todos los usuarios obtenidos",
        {
          usuarios: todosUsuarios,
        },
        200,
      );
    } catch (error) {
      console.log("Error interno todos los usuarios:", error);

      return respuestaAlFront(
        res,
        "error",
        "Error interno todos los usuarios",
        {},
        500,
      );
    }
  }

  static async actualizarUsuario(req, res) {
    try {
      const validaciones = await validarActualizarUsuario(req);

      if (validaciones.status === "error") {
        return respuestaAlFront(
          res,
          validaciones.status,
          validaciones.message,
          {},
          validaciones.codigo ? validaciones.codigo : 400,
        );
      }

      const usuarioEliminado = await UserModel.actualizarUsuario(
        validaciones.id,
        validaciones.nombre,
        validaciones.correo,
        validaciones.rol_id,
      );

      if (!usuarioEliminado) {
        return respuestaAlFront(
          res,
          "error",
          "Error al actualizar usuario",
          {},
          400,
        );
      }

      return respuestaAlFront(
        res,
        "ok",
        "Usuario actualizado con exito",
        {
          usuarios: usuarioEliminado,
        },
        200,
      );
    } catch (error) {
      console.log("Error interno actualizar usuario:", error);

      return respuestaAlFront(
        res,
        "error",
        "Error interno actualizar usuario",
        {},
        500,
      );
    }
  }

  static async eliminarUsuario(req, res) {
    try {
      const validaciones = await validarEliminarUsuario(req);

      if (validaciones.status === "error") {
        return respuestaAlFront(
          res,
          validaciones.status,
          validaciones.message,
          {},
          validaciones.codigo ? validaciones.codigo : 400,
        );
      }

      const usuarioEliminado = await UserModel.eliminarUsuario(validaciones.id);

      if (!usuarioEliminado) {
        return respuestaAlFront(
          res,
          "error",
          "Error al eliminar usuario",
          {},
          400,
        );
      }

      return respuestaAlFront(
        res,
        "ok",
        "Usuario eliminado con exito",
        {
          usuarios: usuarioEliminado,
        },
        200,
      );
    } catch (error) {
      console.log("Error interno eliminar usuario:", error);

      return respuestaAlFront(
        res,
        "error",
        "Error interno eliminar usuario",
        {},
        500,
      );
    }
  }

  // 1. Buscar usuario (estudiante = rol_id 3) por cédula y letra (V/E)
  static async buscarUsuarioCedula(req, res) {
    try {
      const validaciones = await validarBuscarUsuarioCedula(req);

      if (validaciones.status === "error") {
        return respuestaAlFront(
          res,
          validaciones.status,
          validaciones.message,
          {},
          validaciones.codigo ? validaciones.codigo : 400,
        );
      }

      const estudiante = await UserModel.buscarUsuarioCedula(
        validaciones.cedula,
        validaciones.pais,
      );

      if (!estudiante) {
        return respuestaAlFront(
          res,
          "error",
          "Estudiante no se encontro",
          {},
          404,
        );
      }

      return respuestaAlFront(
        res,
        "ok",
        "Estudiante encontrado",
        {
          estudiante: estudiante,
        },
        201,
      );
    } catch (error) {
      console.log("Error interno buscar estudiante cedula:", error);

      return respuestaAlFront(
        res,
        "error",
        "Error interno buscar estudiante cedula",
        {},
        500,
      );
    }
  }

  static async obtenerDatosDeUsuario(req, res) {
      try {
          // CAMBIO CLAVE: Usamos 'usuarioId' que es como viene en tu token
          const userId = req.authData?.usuarioId;

          if (!userId) {
              console.error("Error: No se encontró usuarioId en el token");
              return res.status(401).json({ 
                  status: 'error', 
                  message: 'No hay usuarioId en el token' 
              });
          }

          // Llamamos al modelo con el ID correcto
          const usuario = await UserModel.buscarUsuarioPorId(userId);

          if (!usuario) {
              return res.status(404).json({ 
                  status: 'error', 
                  message: 'Usuario no existe en la base de datos' 
              });
          }

          // Enviamos los datos al frontend
          res.json(usuario);
      } catch (error) {
          console.error("Error en obtenerDatosDeUsuario:", error);
          res.status(500).json({ 
              status: 'error', 
              message: 'Error interno de servidor' 
          });
      }
  }
}
