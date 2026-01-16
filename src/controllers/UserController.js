import { UserModel } from "../models/UserModel.js";
import validarCrearUsuario from "../services/usuarios/validarCrearUsuario.js";
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
        3,
        texto,
        pais === "v" ? 1 : 0
      );

      if (validaciones.status === "error") {
        return respuestaAlFront(
          res,
          validaciones.status,
          validaciones.message,
          {},
          validaciones.codigo ? validaciones.codigo : 400
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
          400
        );
      }

      return respuestaAlFront(
        res,
        "ok",
        "Usuario creado con exito",
        {
          redirect: "/login",
        },
        201
      );
    } catch (error) {
      console.error("Error interno crear usuario:", error);

      return respuestaAlFront(
        res,
        "error",
        "Error interno crear contacto",
        {},
        500
      );
    }
  }
}
