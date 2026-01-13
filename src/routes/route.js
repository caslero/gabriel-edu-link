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




//esta y la siguiente ruta debes crear la vista y modificarla aqui.
//es decir cambias el nombre del archivo y el titulo
rutas.get("/registro-usuario", (req, res) => {
  res.render("index", { title: "Inicio - EduLink", user: null });
});

rutas.get("/login", (req, res) => {
  res.render("index", { title: "Inicio - EduLink", user: null });
});

export default rutas;

