import { emailRegex } from "../utils/regex/correoRegex.js";
import { fechaFormatoIsoRegex } from "../utils/regex/fechaFormatoIsoRegex.js";
import { textRegex } from "../utils/regex/textRegex.js";
import respuestasAlBack from "../utils/respuestasAlBack.js";
import { claveRegex } from "../utils/regex/claveRegex.js";
import { quitarCaracteres } from "../utils/quitarCaracteres.js";
import { cedulaRegex } from "../utils/regex/cedulaRegex.js";

// src/utils/ValidarCampos.js
export default class ValidarCampos {
  /**
   Valida el campo de cédula venezolana. Limpia caracteres no numéricos, verifica que sea un número
   válido y que cumpla con el formato.
   @function validarCampoCedula
   @param {string|number} cedula - Cédula ingresada por el usuario.
   @returns {Object} Objeto con estado, mensaje y cédula validada.
  */
  static validarCampoCedula(cedula) {
    try {
      // 1. Verifica si el campo está vacío
      if (!cedula) {
        return respuestasAlBack("error", "Campo cedula vacio...");
      }

      // 2. Elimina caracteres no numéricos
      const cedulaLimpia = quitarCaracteres(cedula);

      // 3. Convierte a número
      const cedulaNumero = Number(cedulaLimpia);

      // 4. Verifica si es un número válido
      if (isNaN(cedulaNumero)) {
        return respuestasAlBack("error", "Error, cedula inválida...");
      }

      // 5. Verifica longitud válida (7 u 8 dígitos)
      if (cedulaNumero.length < 7 || cedulaNumero.length > 8) {
        return respuestasAlBack("error", "Error, cedula incorrecta....");
      }

      // 6. Verifica formato con expresión regular
      if (!cedulaRegex.test(cedulaNumero)) {
        return respuestasAlBack("error", "Formato de cédula invalido...");
      }

      // 7. Retorna respuesta exitosa con la cédula validada
      return respuestasAlBack("ok", "Campo cedula correcto...", {
        cedula: cedulaNumero,
      });
    } catch (error) {
      // 8. Manejo de errores inesperados
      console.log(`Error interno, campo cedula: ` + error);

      // Retorna una respuesta del error inesperado
      return respuestasAlBack("error", "Error interno, campo cedula");
    }
  }

  /**
   Valida el campo de correo electrónico. Verifica que no esté vacío y que cumpla con el formato
   estándar. Convierte el correo a minúsculas para normalizarlo.
   @function validarCampoCorreo
   @param {string} correo - Correo electrónico ingresado por el usuario.
   @returns {Object} Objeto con estado, mensaje y correo normalizado si es válido.
  */
  static validarCampoCorreo(correo) {
    try {
      // 1. Verifica si el campo está vacío
      if (!correo) {
        return respuestasAlBack("error", "Campo correo vacio...");
      }

      // 2. Valida el formato del correo usando expresión regular
      if (!emailRegex.test(correo)) {
        return respuestasAlBack(
          "error",
          "Error, formato de correo invalido..."
        );
      }

      // 3. Normaliza el correo a minúsculas
      const correoLetrasMinusculas = correo.toLowerCase();

      // 4. Retorna respuesta exitosa con el correo validado
      return respuestasAlBack("ok", "Campo correo correcto...", {
        correo: correoLetrasMinusculas,
      });
    } catch (error) {
      // 5. Manejo de errores inesperados
      console.log(`Error interno campo correo: ` + error);

      // Retorna una respuesta del error inesperado
      return respuestasAlBack("error", "Error interno campo correo");
    }
  }

  /**
   Valida el campo de nombre. Verifica que no esté vacío y que cumpla con el formato de texto
   permitido (letras y espacios). Convierte el nombre a minúsculas para normalizarlo.
   @function validarCampoNombre
   @param {string} nombre - Nombre ingresado por el usuario.
   @returns {Object} Objeto con estado, mensaje y nombre normalizado si es válido.
  */
  static validarCampoNombre(nombre) {
    try {
      // 1. Verifica si el campo está vacío
      if (!nombre) {
        return respuestasAlBack("error", "Error, campo nombre vacio...");
      }

      // 2. Valida el formato del nombre usando expresión regular
      if (!textRegex.test(nombre)) {
        return respuestasAlBack(
          "error",
          "Error, formato de nombre invalido..."
        );
      }

      // 3. Normaliza el nombre a minúsculas
      const nombreLetrasMinusculas = nombre.toLowerCase();

      // 4. Retorna respuesta exitosa con el nombre validado
      return respuestasAlBack("ok", "Campo nombre correcto", {
        nombre: nombreLetrasMinusculas,
      });
    } catch (error) {
      // 5. Manejo de errores inesperados
      console.log(`Error interno campo nombre: ` + error);

      // Retorna una respuesta del error inesperado
      return respuestasAlBack("error", "Error interno campo nombre");
    }
  }

  /**
   Valida un campo de ID numérico. Verifica que no esté vacío, que sea un número válido y mayor a cero.
   El mensaje se personaliza según el tipo de ID indicado en `detalles`.
   @function validarCampoId
   @param {string|number} id - ID ingresado por el usuario.
   @param {string} detalles - Descripción del campo (ej. "usuario", "institución").
   @returns {Object} Objeto con estado, mensaje y ID validado.
  */
  static validarCampoId(id, detalles) {
    try {
      // 1. Verifica si el campo está vacío
      if (!id) {
        return respuestasAlBack("error", `Campo id ${detalles} vacio...`);
      }

      // 2. Convierte el valor a número
      const idNumero = Number(id);

      // 3. Verifica si es un número válido y positivo
      if (isNaN(idNumero) || idNumero <= 0) {
        return respuestasAlBack("error", `Error, id ${detalles} inválido...`);
      }

      // 4. Retorna respuesta exitosa con el ID validado
      return respuestasAlBack("ok", `Campo id ${detalles} valido...`, {
        id: idNumero,
      });
    } catch (error) {
      // 5. Manejo de errores inesperados
      console.log(`Error, interno al (validar id ${detalles}): ` + error);

      // Retorna una respuesta del error inesperado
      return respuestasAlBack(
        "error",
        `Error, interno al (validar id ${detalles})`
      );
    }
  }

  /**
   Valida los campos de contraseña y confirmación. Verifica que ambos estén presentes, que coincidan,
   y que cumplan con el formato seguro.
   @function validarCampoClave
   @param {string} claveUno - Contraseña principal ingresada por el usuario.
   @param {string} claveDos - Confirmación de la contraseña.
   @returns {Object} Objeto con estado, mensaje y claves validadas.
  */
  static validarCampoClave(claveUno, claveDos) {
    try {
      // 1. Verifica si la contraseña principal está vacía
      if (!claveUno) {
        return respuestasAlBack("error", "Error campo clave vacio...");
      }

      // 2. Verifica si el campo de confirmación está vacío
      if (!claveDos) {
        return respuestasAlBack(
          "error",
          "Error campo confirmar clave vacio..."
        );
      }

      // 3. Verifica si ambas contraseñas coinciden
      if (claveUno !== claveDos) {
        return respuestasAlBack("error", "Error, claves no coinciden...");
      }

      // 4. Verifica si la contraseña cumple con el formato seguro
      if (!claveRegex.test(claveUno)) {
        return respuestasAlBack("error", "Error, formato de clave invalido...");
      }

      // 5. Retorna respuesta exitosa con las claves validadas
      return respuestasAlBack("ok", "Campos de clave validados...", {
        claveUno: claveUno,
        claveDos: claveDos,
      });
    } catch (error) {
      // 6. Manejo de errores inesperados
      console.log(`Error interno, campos claves: ` + error);

      // Retorna una respuesta del error inesperado
      return respuestasAlBack("error", "Error interno, campos claves");
    }
  }

  /**
   Valida una fecha en formato ISO. Verifica que la fecha esté presente, tenga formato válido, sea
   interpretable, no esté en el futuro y no sea anterior al año 1900.
   @function validarCampoFechaISO
   @param {string} fecha - Fecha en formato ISO (ej. "2023-08-15T00:00:00Z").
   @returns {Object} Objeto con estado, mensaje y fecha convertida a objeto Date.
  */
  static validarCampoFechaISO(fecha) {
    try {
      // 1. Verifica si el campo está vacío
      if (!fecha) {
        return respuestasAlBack("error", "Campo fecha vacio...");
      }

      // 2. Verifica si el formato cumple con la expresión regular ISO
      if (!fechaFormatoIsoRegex.test(fecha)) {
        return respuestasAlBack("error", "Error formato de fecha invalido...");
      }

      // 3. Intenta convertir la fecha a objeto Date
      const fechaConvertida = new Date(fecha);

      // 4. Si la verificación es incorrecta retorna un error
      if (isNaN(fechaConvertida.getTime())) {
        return respuestasAlBack(
          "error",
          "Error no se puede interpretar la fecha..."
        );
      }

      // 5. Define límites de fecha
      const ahora = new Date();
      const fechaMinima = new Date("1900-01-01T00:00:00Z"); // ajustable si se necesita otro límite

      // 6. Verifica que la fecha no sea futura
      if (fechaConvertida > ahora) {
        return respuestasAlBack(
          "error",
          "Error fecha no puede pasar el dia actual..."
        );
      }

      // 7. Verifica que la fecha no sea demasiado antigua
      if (fechaConvertida < fechaMinima) {
        return respuestasAlBack("error", "Error fecha muy antigua...");
      }

      // 8. Retorna respuesta exitosa con la fecha convertida
      return respuestasAlBack("ok", "Campo fecha correcto...", {
        fecha: fechaConvertida,
      });
    } catch (error) {
      // 9. Manejo de errores inesperados
      console.log(`Error interno, campo fecha: ` + error);

      // Retorna una respuesta del error inesperado
      return respuestasAlBack("error", "Error, interno campo fecha...");
    }
  }
}
