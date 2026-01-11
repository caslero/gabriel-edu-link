# Gabriel Edu Link

Proyecto Node.js con Express, EJS, JWT, bcryptjs, siguiendo MVC y SOLID, usando SQLite con SQL puro.

## Instalación

1. Instalar dependencias: `npm install`
2. Ejecutar en desarrollo: `npm run dev`
3. Ejecutar en producción: `npm start`

## Estructura

- `controllers/`: Controladores MVC
- `models/`: Modelos de datos
- `services/`: Lógica de negocio
- `routes/`: Definición de rutas
- `middlewares/`: Middlewares personalizados
- `views/`: Plantillas EJS
- `config/`: Configuración de base de datos
- `public/`: Archivos estáticos

## API

- POST /auth/register: Registrar usuario
- POST /auth/login: Iniciar sesión
- GET /users/profile: Obtener perfil (requiere token)

Usar Authorization: Bearer <token> en headers.