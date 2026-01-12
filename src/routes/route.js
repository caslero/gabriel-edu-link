import express from "express";

const rutas = express.Router();

rutas.get("/", (req, res) => {
  res.render("index", { title: "Inicio - EduLink", user: null });
});

// layout partial
rutas.get('/partials/layout', (req, res) => {
  res.render('partials/layout');
});

// Header partial
rutas.get('/partials/header', (req, res) => {
  res.render('partials/header');
});

// Footer partial
rutas.get('/partials/footer', (req, res) => {
  res.render('partials/footer');
});

export default rutas;

