/**
 Expresión regular para validar contraseñas seguras. Requiere al menos una minúscula, una mayúscula,
 un número y un carácter especial. Longitud permitida: entre 8 y 16 caracteres.
*/
export const claveRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8,16}$/;
