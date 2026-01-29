import { db } from '../config/database.js'; // <--- Asegúrate que el nombre sea exacto

export const verificarInscripcionPrevia = async (estudiante_id, seccion_id) => {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT id 
            FROM inscripciones 
            WHERE estudiante_id = ? 
              AND seccion_id = ? 
              AND estado = 'Aprobada' 
              AND borrado = 0 
            LIMIT 1`;

        db.get(sql, [estudiante_id, seccion_id], (err, row) => {
            if (err) {
                console.error("Error en verificarInscripcionPrevia:", err.message);
                return reject(err);
            }
            // Retorna true si existe el registro, false si no
            resolve(!!row);
        });
    });
};