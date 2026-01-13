/**
 @fileoverview Servicio para validar el inicio de sesión de un usuario. Verifica los campos de entrada,
 consulta la base de datos, compara la contraseña, genera un token de autenticación y determina la
 redirección según el rol. Utiliza Prisma como ORM, servicios personalizados para validación y cifrado,
 y una utilidad para estructurar respuestas internas. @module services/login/validarLogin
*/

import CifrarDescifrarClaves from "../../libs/CifrarDescifrarClaves";
import { UserModel } from "../../models/UserModel";
import AuthTokens from "../../libs/AuthTokens";
import validarCamposLogin from "./validarCamposLogin";
import respuestasAlBack from "../../utils/respuestasAlBack";

/**
 Valida el proceso de inicio de sesión de un usuario. Comprueba los campos, verifica credenciales,
 genera token y determina redirección.
 @async
 @function validarLogin
 @param {string} correo - Correo electrónico del usuario.
 @param {string} clave - Contraseña ingresada por el usuario.
 @returns {Promise<Object>} Objeto con estado, mensaje y datos del usuario o error.
*/
export default async function validarLogin(correo, clave) {
  try {
    // 1. Validar los campos de entrada
    const validandoCampos = validarCamposLogin(correo, clave);

    // 2. Si la validación falla retornamos una respuesta
    if (validandoCampos.status === "error") {
      return respuestasAlBack(validandoCampos.status, validandoCampos.message);
    }

    // 3. Buscar usuario en la base de datos
    const datosInicioSesion = await UserModel.buscarUsuarioPorCorreo(
      validandoCampos.correo
    );

    // 4. Verificar si el usuario existe
    if (!datosInicioSesion) {
      return respuestasAlBack("error", "Error usuario no existe", {
        correo: validandoCampos.correo,
      });
    }

    // 5. Verificar si el usuario está eliminado o suspendido
    if (datosInicioSesion.borrado) {
      return respuestasAlBack("error", "Usuario eliminado o suspendido");
    }

    // 6. Comparar la contraseña ingresada con la almacenada
    const claveEncriptada = await CifrarDescifrarClaves.compararClave(
      validandoCampos.clave,
      datosInicioSesion.clave
    );

    // 8. Si la validación falla retornamos una respuesta
    if (claveEncriptada.status === "error") {
      return respuestasAlBack(claveEncriptada.status, claveEncriptada.message);
    }

    // 9. Determinar la ruta de redirección según el rol del usuario
    const redirecciones = {
      1: "/dashboard/master",
      2: "/dashboard/administrador",
      3: "/dashboard/comun",
    };

    // 10. Tomamos la direccion por el id_rol o la raiz
    const redirect = redirecciones[datosInicioSesion.rol] || "/";

    // 11. Generar token de sesión
    const crearTokenInicioSesion = AuthTokens.tokenInicioSesion(
      validandoCampos.correo,
      datosInicioSesion.rol
    );

    // 12. Si la validación falla retornamos una respuesta
    if (crearTokenInicioSesion.status === "error") {
      return respuestasAlBack(
        crearTokenInicioSesion.status,
        crearTokenInicioSesion.message
      );
    }

    // 13. Retornar respuesta exitosa con datos del usuario y token
    return respuestasAlBack("ok", "Iniciando sesion", {
      token: crearTokenInicioSesion.token,
      cookie: crearTokenInicioSesion.cookieOption,
      redirect: redirect,
      correo: datosInicioSesion.correo,
      clave: datosInicioSesion.clave,
      rol: datosInicioSesion.rol,
      borrado: datosInicioSesion.borrado,
    });
  } catch (error) {
    // 14. Manejo de errores inesperados
    console.error(`Error interno validar inicio sesion: ` + error);

    // Retorna una respuesta del error inesperado
    return respuestasAlBack("error", "Error interno validar inicio sesion");
  }
}
