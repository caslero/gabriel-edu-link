import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { initDatabase } from "./config/database.js";
import rutas from "./routes/route.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configurar EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Archivos estáticos
app.use(express.static(path.join(__dirname, "public")));

// Inicializar base de datos
initDatabase();

// Rutas
app.use(rutas);

// Ruta principal
app.get("/", (req, res) => {
  res.render("index", { title: "Inicio" });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Algo salió mal!");
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

export default app;
