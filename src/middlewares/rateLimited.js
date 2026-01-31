import { rateLimit } from "express-rate-limit";
import { respuestaAlFront } from "../utils/respuestaAlFront.js";

// Limitador específico para el Login (más estricto)
export const loginLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto //windowMs: 15 * 60 * 1000, // 15 minuto
  limit: 5, // Máximo 5 intentos por IP
  handler: (req, res) => {
    return respuestaAlFront(
      res,
      "error",
      "Demasiados intentos. Acceso bloqueado por 1 minuto.",
      {},
      429, // Código HTTP para "Too Many Requests"
    );
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Limitador general (opcional, para proteger otras rutas)
export const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  limit: 10, // 50 peticiones por minuto
  message: "Has excedido el límite de peticiones permitidas.",
});

// 2. ALTA SEGURIDAD - Gestión de usuarios y roles
export const adminLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  limit: 20, // 20 operaciones máximo
  message: "Demasiadas operaciones administrativas. Espera 5 minutos.",
  standardHeaders: true,
  legacyHeaders: false,
});

// 3. MEDIA SEGURIDAD - Operaciones de creación/actualización
export const writeLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  limit: 10, // 10 operaciones de escritura por minuto
  message: "Demasiadas operaciones de modificación. Intenta más tarde.",
  standardHeaders: true,
  legacyHeaders: false,
});

// 4. BAJA SEGURIDAD - Consultas y listados (protección básica)
export const readLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  limit: 100, // 100 consultas por minuto
  message: "Demasiadas consultas. Espera un momento.",
  standardHeaders: true,
  legacyHeaders: false,
});

// 5. ESPECÍFICO - Inscripciones y adición/retiro (MEDIA-ALTA)
export const inscripcionLimiter = rateLimit({
  windowMs: 2 * 60 * 1000, // 2 minutos
  limit: 15, // 15 operaciones por 2 minutos
  message: "Límite de operaciones de inscripción alcanzado. Espera 2 minutos.",
  standardHeaders: true,
  legacyHeaders: false,
});

// 6. ESPECÍFICO - Búsqueda de estudiantes (MEDIA)
export const busquedaLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  limit: 30, // 30 búsquedas por minuto
  message: "Demasiadas búsquedas. Intenta más tarde.",
  standardHeaders: true,
  legacyHeaders: false,
});

// 7. ESPECÍFICO - Gestión de solicitudes (MEDIA-ALTA)
export const gestionLimiter = rateLimit({
  windowMs: 2 * 60 * 1000, // 2 minutos
  limit: 10, // 10 gestiones por 2 minutos
  message: "Demasiadas gestiones de solicitudes. Espera 2 minutos.",
  standardHeaders: true,
  legacyHeaders: false,
});
