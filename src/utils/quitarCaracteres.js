/**
 @fileoverview Función para eliminar caracteres no deseados de una cadena. Utiliza una expresión regular
 definida externamente para limpiar el texto. Ideal para sanitizar entradas de usuario o normalizar
 datos antes de procesarlos. @module utils/quitarCaracteres
*/

import { sinCaracteresRegex } from "./regex/sinCaracteresRegex"; // Expresión regular para filtrar caracteres no permitidos

/**
 Elimina caracteres no deseados de una cadena utilizando una expresión regular. Retorna la cadena
 limpia o `false` en caso de error.
 @function quitarCaracteres
 @param {string} cadena - Texto original que se desea limpiar.
 @returns {string|boolean} Cadena sin caracteres no válidos o `false` si ocurre un error.
*/
export function quitarCaracteres(cadena) {
  try {
    // 1. Aplica la expresión regular para eliminar caracteres no deseados
    const nuevaCadena = cadena.replace(sinCaracteresRegex, "");

    // 2. Retorna la cadena limpia
    return nuevaCadena;
  } catch (error) {
    // 3. Manejo de errores inesperados
    console.log("Error interno quitar caracteres: " + error);

    // Retorno de false de errores inesperados
    return false;
  }
}
