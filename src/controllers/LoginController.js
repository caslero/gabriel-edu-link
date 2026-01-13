import prisma from "#root/config/prisma.js";
import validarLogin from "#root/services/login/validarLogin.js";
import { respuestaAlFront } from "#root/utils/respuestaAlFront.js";
import nombreToken from "#root/libs/nombreToken.js";
import { emitirUsuarioOnline } from "#root/config/socket/usuarios/emitirUsuarioOnline.js";

export default class LoginController {
  static async login(req, res) {
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
          validaciones.codigo ? validaciones.codigo : 400
        );
      }

      await prisma.sesion.create({
        data: {
          usuarioId: validaciones.usuarioId,
          token: validaciones.token,
          activo: true,
          ip: req.ip || req.headers["x-forwarded-for"], // Captura la IP
          device: req.headers["user-agent"], // Captura el dispositivo/navegador
          expiresAt: validaciones.cookie.expires,
        },
      });

      // 5. Configura la cookie y responde (Express usa res.cookie)
      res.cookie(nombreToken, validaciones.token, validaciones.cookieOption);

      emitirUsuarioOnline({
        usuarioId: validaciones.usuarioId,
      });

      return respuestaAlFront(
        res,
        "ok",
        "Iniciando sesión...",
        {
          redirect: "/chat",
        },
        200
      );
    } catch (error) {
      console.error(`Error interno al iniciar sesion: `, error);

      return respuestaAlFront(
        res,
        "error",
        "Error interno al iniciar sesion",
        {},
        500
      );
    }
  }

  static async logout(req, res) {
    try {
      // 1. Elimina la cookie en Express
      // res.clearCookie(nombreToken, {
      //   path: "/", // Asegura que se borre en todo el sitio
      //   httpOnly: true,
      // });

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
        200
      );
    } catch (error) {
      console.error("Error interno cerrando sesión:", error);

      return respuestaAlFront(
        res,
        "error",
        "Error interno cerrando sesión",
        {},
        500
      );
    }
  }
}
