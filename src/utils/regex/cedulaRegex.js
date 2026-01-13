/**
 Expresión regular para validar cédulas venezolanas. Deben comenzar con un número distinto de cero
 y tener entre 7 y 8 dígitos. Ejemplo válido: 12345678
*/
export const cedulaRegex = /^[1-9][0-9]{6,7}$/;
