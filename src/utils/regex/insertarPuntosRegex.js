/**
 Regex que inserta puntos cada 3 dígitos desde la derecha,
 útil para formatear números con separadores de miles.
 @type {RegExp}
*/
export const insertarPuntosRegex = /\B(?=(\d{3})+(?!\d))/g;
