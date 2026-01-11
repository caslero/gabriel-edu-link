/**
 @fileoverview Clase utilitaria para cifrado y comparación de contraseñas. Utiliza la librería bcryptjs
 para encriptar claves y verificar coincidencias. Proporciona métodos estáticos para facilitar su uso
 en controladores o servicios. @module utils/CifrarDescifrarClaves
*/

import bcryptjs from "bcryptjs"; // Librería para cifrado seguro de contraseñas

/**
 Clase que encapsula métodos para cifrar y comparar contraseñas. Utiliza funciones asincrónicas para
 garantizar operaciones seguras y no bloqueantes.
*/
export default class CifrarDescifrarClaves {
  /**
   Cifra una contraseña utilizando bcryptjs con un nivel de sal definido.
   @async
   @function cifrarClave
   @param {string} clave - Contraseña en texto plano que se desea cifrar.
   @returns {Promise<Object>} Objeto con estado, mensaje y clave encriptada si es exitoso.
  */
  static async cifrarClave(clave) {
    try {
      // 1. Genera una sal con complejidad 5
      const encriptado = await bcryptjs.genSalt(5);

      // 2. Cifra la clave utilizando la sal generada
      const claveEncriptada = await bcryptjs.hash(clave, encriptado);

      // 3. Retorna la clave cifrada en una respuesta exitosa
      return {
        status: "ok",
        message: "Clave encriptada con exito...",
        claveEncriptada: claveEncriptada,
      };
    } catch (error) {
      // 4. Manejo de errores inesperados durante el cifrado
      console.log("Error, al encriptar clave: " + error);

      // Retorno de una respuesta de error inesperado
      return {
        status: "error",
        message: "Error, al encriptar clave...",
      };
    }
  }

  /**
   Compara una contraseña en texto plano con una ya cifrada.
   @async
   @function compararClave
   @param {string} clave - Contraseña ingresada por el usuario.
   @param {string} claveGuardada - Contraseña cifrada almacenada en la base de datos.
   @returns {Promise<Object>} Objeto con estado y mensaje según el resultado de la comparación.
  */
  static async compararClave(clave, claveGuardada) {
    try {
      // 1. Compara la clave ingresada con la clave cifrada
      const comparada = await bcryptjs.compare(clave, claveGuardada);

      // 2. Si no coinciden, retorna error de credenciales
      if (!comparada) {
        return {
          status: "error",
          message: "Error, credenciales invalidas...",
        };
      }

      // 3. Si coinciden, retorna éxito
      return {
        status: "ok",
        message: "Claves verificadas con éxito...",
      };
    } catch (error) {
      // 4. Manejo de errores durante la comparación
      console.log("Error, al comparar clave: " + error);

      // Retorno de una respuesta de error inesperado
      return {
        status: "error",
        message: "Error interno al comparar claves...",
      };
    }
  }
}
