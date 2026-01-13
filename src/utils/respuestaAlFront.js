/**
 @fileoverview
 Utilidades para generar respuestas HTTP estandarizadas en Node.js/Express.
 Incluye funciones para retornar respuestas JSON estructuradas y consistentes en controladores
 y endpoints de API.
 @module utils/respuestasAlFront
*/

/**
 Genera una respuesta HTTP en formato JSON con estructura estandarizada.
 Ideal para APIs que retornan estado, mensaje y datos adicionales.
 @function respuestaAlFront
 @param {import("express").Response} res - Objeto de respuesta de Express.
 @param {string} status - Estado de la operación ("ok", "error", etc.).
 @param {string} message - Mensaje descriptivo para el cliente.
 @param {Object} [data={}] - Datos adicionales que se incluirán en la respuesta.
 @param {number} [statusCode=200] - Código de estado HTTP (ej. 200, 400, 500).
 @returns {void} Envía la respuesta JSON al cliente.
*/
export function respuestaAlFront(
  res,
  status,
  message,
  data = {},
  statusCode = 200
) {
  res.status(statusCode).json({
    status,
    message,
    ...data,
  });
}
