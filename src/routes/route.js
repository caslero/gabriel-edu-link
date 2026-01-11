import express from "express";

const rutas = express.Router();

rutas.get("/", (req, res) => {
  res.render("index", { title: "Inicio - EduLink" });
});

export default rutas;
