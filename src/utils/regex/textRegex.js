/**
 Expresión regular para validar textos que solo contengan letras (mayúsculas y minúsculas), espacios
 y caracteres especiales del español como ñ y vocales acentuadas.
*/
export const textRegex = /^[a-zA-Z\sñÑáéíóúÁÉÍÓÚ]+$/;