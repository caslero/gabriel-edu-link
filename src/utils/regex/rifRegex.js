/**
 Expresión regular para validar el formato del RIF venezolano. Ejemplo válido: V-12345678-9
*/
export const rifRegex = /^[VEJPGCL]-\d{8}-\d$/;