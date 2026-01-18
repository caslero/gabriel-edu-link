import nombreToken from "../libs/nombreToken.js";
import validarLogin from "../services/login/validarLogin.js";
import { respuestaAlFront } from "../utils/respuestaAlFront.js";

export default class LoginController {
  static async iniciarSesion(req, res) {
    try {
      // 1. Extrae datos del cuerpo (Express usa req.body)
      const { correo, clave } = req.body;

      // 2. Valida las credenciales
      const validaciones = await validarLogin(correo, clave);

      // 3. Condición de validación fallida
      if (validaciones.status === "error") {
        return respuestaAlFront(
          res,
          validaciones.status,
          validaciones.message,
          {},
          validaciones.codigo ? validaciones.codigo : 400,
        );
      }

      // 5. Configura la cookie y responde (Express usa res.cookie)
      res.cookie(nombreToken, validaciones.token, validaciones.cookieOption);

      return respuestaAlFront(
        res,
        "ok",
        "Iniciando sesión...",
        {
          redirect: validaciones.redirect,
        },
        200,
      );
    } catch (error) {
      console.error(`Error interno al iniciar sesion: `, error);

      return respuestaAlFront(
        res,
        "error",
        "Error interno al iniciar sesion",
        {},
        500,
      );
    }
  }

  static async logout(req, res) {
    try {
      // 1. Elimina la cookie en Express
      res.clearCookie(nombreToken, {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Coincidir con la creación
        sameSite: "lax",
      });

      // 2. Responde al cliente
      return respuestaAlFront(
        res,
        "ok",
        "Cerrando sesion",
        { redirect: "/" },
        200,
      );
    } catch (error) {
      console.error("Error interno cerrando sesión:", error);

      return respuestaAlFront(
        res,
        "error",
        "Error interno cerrando sesión",
        {},
        500,
      );
    }
  }
}
