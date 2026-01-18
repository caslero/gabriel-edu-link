/**
 * @fileoverview Controlador Express para obtener los datos completos del usuario activo
 * a partir del token de autenticación, incluyendo su rol, institución y departamento.
 * @module controllers/usuarios/obtenerDatosUsuarioToken
 */

import { UserModel } from "../models/UserModel.js";
import respuestasAlBack from "../utils/respuestasAlBack.js";
import obtenerCorreoToken from "./obtenerCorreoToken.js";

/**
 * Controlador Express que obtiene los datos del usuario activo utilizando su correo extraído del token.
 * @async
 * @function obtenerDatosUsuarioToken
 * @param {import("express").Request} req - Objeto de la petición Express
 * @param {import("express").Response} res - Objeto de la respuesta Express
 * @returns {Promise<void>} Envía la respuesta estructurada al cliente
 */
export default async function obtenerDatosUsuarioToken(req) {
  try {
    // 1. Extraer correo y rol del token de autenticación.
    const validaciones = await obtenerCorreoToken(req);

    // 2. Si el token es inválido o no contiene datos, retornar error.
    if (validaciones.status === "error") {
      return respuestasAlBack(validaciones.status, validaciones.message);
    }

    // 3. Consultar en la base de datos los datos del usuario por correo.
    const datosUsuario = await UserModel.buscarUsuarioPorCorreo(
      validaciones.correo,
    );

    // 4. Si no se encuentra el usuario, retornar error.
    if (!datosUsuario) {
      return respuestasAlBack("error", "Error, usuario no existe", {
        codigo: 404,
      });
    }

    // 5. Retornar los datos consolidados del usuario.
    return respuestasAlBack("ok", "Datos usuario obtenidos...", {
      usuarioId: datosUsuario.id,
      nombre: datosUsuario.nombre,
      correo: validaciones.correo,
      rolId: datosUsuario.rol_id,
    });
  } catch (error) {
    console.error("Error interno obtener datos usuario:", error);

    return respuestasAlBack("error", "Error interno obtener datos usuario");
  }
}
