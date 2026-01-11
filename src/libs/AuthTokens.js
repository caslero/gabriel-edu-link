/**
 @fileoverview Clase utilitaria para la generación, validación y descifrado de tokens JWT. Esta clase
 encapsula la lógica de autenticación del sistema, incluyendo la creación de cookies seguras y la
 verificación de tokens firmados. Utiliza la librería `jsonwebtoken` y variables de entorno.
 @module utils/AuthTokens
*/
import jsonwebtoken from "jsonwebtoken"; // 1. Importa la librería para manejo de JWT

// Clase estática para gestionar tokens de autenticación.
export default class AuthTokens {
  /**
   Genera un token aleatorio para validación de usuario. Utiliza cadenas pseudoaleatorias y las
   concatena tras filtrado.
   @static
   @function tokenValidarUsuario
   @param {number} num - Longitud deseada de cada segmento del token.
   @returns {string} Token generado.
  */
  static tokenValidarUsuario(num) {
    try {
      // 2. Genera dos cadenas aleatorias
      let result1 = Math.random().toString(34).substring(0, num);
      let result2 = Math.random().toString(34).substring(0, num);

      // 3. Filtra y extrae partes que comienzan con "0."
      const token1 = result1
        .split("; ")
        .find((cookie) => cookie.startsWith("0."))
        .slice(2);
      const token2 = result2
        .split("; ")
        .find((cookie) => cookie.startsWith("0."))
        .slice(2);

      // 4. Retorna el token combinado
      return {
        status: "ok",
        message: "Token creado con éxito...",
        token: token1 + token2,
      };
    } catch (error) {
      // Manejo de errores inesperados (bloque catch)
      console.error("Error al generar el token validar usuario: " + error);

      // Retorna una respuesta de un error inesperado
      return {
        status: "error",
        numero: 0,
        message: "Error token validar usuario...",
      };
    }
  }

  /**
   Genera un token JWT para el inicio de sesión y configura la cookie. Valida que las variables de
   entorno estén presentes.
   @static
   @function tokenInicioSesion
   @param {string} correo - Correo del usuario.
   @param {number|string} rol - Rol del usuario.
   @returns {Object} Objeto con estado, mensaje, token y opciones de cookie.
  */
  static tokenInicioSesion(correo, rol) {
    try {
      const { JWT_SECRET, JWT_EXPIRATION, JWT_COOKIE_EXPIRES, NODE_ENV } =
        process.env;

      if (!JWT_SECRET || !JWT_EXPIRATION || !JWT_COOKIE_EXPIRES) {
        return {
          status: "error",
          message: "Configuración incompleta en el servidor",
        };
      }

      const token = jsonwebtoken.sign({ correo, rol }, JWT_SECRET, {
        expiresIn: JWT_EXPIRATION,
      });

      // Convertimos a número para evitar errores de cálculo
      const diasExpira = Number(JWT_COOKIE_EXPIRES);

      const cookieOption = {
        expires: new Date(Date.now() + diasExpira * 24 * 60 * 60 * 1000),
        path: "/",
        httpOnly: true,
        secure: NODE_ENV === "production",
        sameSite: "lax",
      };

      return {
        status: "ok",
        message: "Token y configuración de cookie generados",
        token,
        cookieOption,
      };
    } catch (error) {
      console.error("Error al generar token:", error);
      return {
        status: "error",
        message: "Error interno al generar credenciales",
      };
    }
  }

  /**
   Descifra y valida un token JWT. Verifica que el token contenga los campos esperados.
   @static
   @function descifrarToken
   @param {string} token - Token JWT a verificar.
   @returns {Object} Objeto con estado, mensaje y datos del usuario si es válido.
  */
  static descifrarToken(token) {
    try {
      // 9. Verifica que el token no esté vacío
      if (!token) {
        return {
          status: "error",
          message: "Error, token vacío...",
        };
      }

      // 10. Verifica y decodifica el token
      const descifrada = jsonwebtoken.verify(token, process.env.JWT_SECRET);
      const correo = descifrada.correo;

      // 11. Valida que los campos esperados estén presentes
      if (!descifrada || !descifrada.correo || !descifrada.rol) {
        return {
          status: "error",
          message: "Token inválido o incompleto...",
          isValido: false,
        };
      }

      // 12. Retorna los datos descifrados
      return {
        status: "ok",
        numero: 1,
        message: "Token válido...",
        isValido: true,
        correo: correo.toLowerCase(),
        id_rol: descifrada.rol,
      };
    } catch (error) {
      // Manejo de errores inesperados (bloque catch)
      console.error("Error al descifrar el token: " + error);

      // Retorna una respuesta de un error inesperado
      return {
        status: "error",
        message:
          error.name === "TokenExpiredError"
            ? "Token expirado..."
            : "Token incorrecto...",
        isValido: false,
      };
    }
  }
}

/** 
    static tokenInicioSesion(correo, rol) {
      try {
        // 5. Verifica que las variables de entorno no estén indefinidas o vacias
        if (
          !process.env.JWT_SECRET ||
          !process.env.JWT_EXPIRATION ||
          !process.env.JWT_COOKIE_EXPIRES
        ) {
          return {
            status: "error",
            numero: 0,
            message: "Error, variables de entorno vacias...",
          };
        }

        // 6. Firma el token con los datos del usuario
        const token = jsonwebtoken.sign(
          {
            correo: correo,
            rol: rol,
          },
          process.env.JWT_SECRET,
          {
            expiresIn: process.env.JWT_EXPIRATION,
          }
        );

        // 7. Configura las opciones de la cookie
        const cookieOption = {
          expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
          ),
          path: "/",
          httpOnly: true, // Mantener este flag por seguridad
          secure: false, // Cambiar a false si solo usas HTTP
          sameSite: "lax", // Permitir solicitudes dentro de la red sin problemas
        };

        // 8. Retorna el token y la configuración de la cookie
        return {
          status: "ok",
          numero: 1,
          message: "Token/cookie creadas con éxito...",
          token: token,
          cookieOption: cookieOption,
        };
      } catch (error) {
        // Manejo de errores inesperados (bloque catch)
        console.error("Error al generar el token o la cookie: " + error);

        // Retorna una respuesta de un error inesperado
        return {
          status: "error",
          numero: 0,
          message: "Error al crear token/cookie...",
        };
      }
    }
  */

/** 
  // Configurar opciones de la cookie esto para el caso que este en un servidor no local
  const cookieOption = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
    ),
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Solo HTTPS en producción
    sameSite: "strict", // Protección contra CSRF
  };
*/
