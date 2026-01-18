/**
 @fileoverview Función utilitaria para extraer y validar el token de autenticación
 desde las cookies en Express, descifrarlo y obtener el correo electrónico y rol del usuario.
 @module utils/obtenerCorreoToken
*/

import respuestasAlBack from "../utils/respuestasAlBack.js";
import AuthTokens from "./AuthTokens.js";
import nombreToken from "./nombreToken.js";

/**
 Middleware/función para obtener correo y rol desde el token en cookies.
 @async
 @function obtenerCorreoToken
 @param {import("express").Request} req - Objeto de la petición Express
 @param {import("express").Response} res - Objeto de la respuesta Express
 @returns {Promise<void>} Envía la respuesta estructurada al cliente
 */
export default async function obtenerCorreoToken(req) {
  try {
    // 1. Extraer el valor del token usando el nombre definido en 'nombreToken'.
    const token = req.cookies[nombreToken];

    //const authHeader = req.headers["authorization"];

    // 3. Extraer solo el token (quitando la palabra 'Bearer')
    //const token = authHeader && authHeader.split(" ")[1];

    // 2. Descifrar el token para obtener los datos del usuario.
    const descifrarToken = AuthTokens.descifrarToken(token);

    // 3. Si el token no es válido o no se puede descifrar, retornar error.
    if (descifrarToken.status === "error") {
      return respuestasAlBack(descifrarToken.status, descifrarToken.message);
    }

    // 4. Normalizar el correo electrónico a minúsculas.
    const correoObtenido = descifrarToken.correo;
    const correo = correoObtenido.toLowerCase();

    // 5. Retornar el correo y el rol del usuario si todo es correcto.
    return respuestasAlBack("ok", "Correo obtenido correcto...", {
      correo: correo,
      rolId: descifrarToken.id_rol,
    });
  } catch (error) {
    console.error("Error interno obtener correo: " + error);

    // Retorna una respuesta del error inesperado
    return respuestasAlBack("error", "Error interno obtener correo");
  }
}
