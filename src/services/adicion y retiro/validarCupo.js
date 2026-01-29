import { db } from '../config/db.js';

export const verificarDisponibilidadCupo = async (seccion_id) => {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT 
                s.cupos,
                (SELECT COUNT(*) FROM inscripciones WHERE seccion_id = s.id AND estado = 'Aprobada') as inscritos
            FROM secciones s WHERE s.id = ?`;

        db.get(sql, [seccion_id], (err, row) => {
            if (err) return reject(err);
            if (!row) return reject(new Error("Sección no encontrada"));

            const tieneCupo = row.inscritos < row.cupos;
            resolve({ tieneCupo, disponibles: row.cupos - row.inscritos });
        });
    });
};