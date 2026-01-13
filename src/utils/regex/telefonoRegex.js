/**
 Expresión regular para validar números de teléfono venezolanos que comienzan con 0 y tienen
 exactamente 11 dígitos. Ejemplo válido: 04121234567
*/
export const phoneRegex = /^0[0-9]{10}$/;

/**
 Expresión regular para validar números de teléfono venezolanos fijos y móviles. Incluye códigos como
 0212, 0412, 0414, etc.
*/
export const phoneVenezuelaRegex = /^(02\d{2}|04(12|14|16|24|26))\d{7}$/;

/**
 Expresión regular para verificar si el segundo dígito de un número telefónico venezolano móvil
 pertenece a los operadores válidos (2 o 4).
*/
export const digitoDosPhoneVenezuelaRegex = /[24]/;
