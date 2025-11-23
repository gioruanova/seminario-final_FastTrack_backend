const swaggerJSDoc = require("swagger-jsdoc");
require("dotenv").config();

const options = {
  definition: {
    openapi: "3.1.0",
    info: {
      title: "Fast Track API",
      version: "1.0.1",
      description: "Fast Track API documentation",
    },
    tags: [
      { name: "Login y sesiones", description: "Rutas para login y session" },
      { name: "User Profile", description: "Rutas para autogestion de perfil" },
      { name: "Users", description: "Rutas para Users" },
      { name: "Company", description: "Gestion de company" },
      { name: "Company Config", description: "Gestion de la configuracion de la empresa" },
      { name: "Especialidades", description: "Gestion de especialidades" },
      { name: "Profesional-Especialidad", description: "Gestion de especialidades a profesionales" },


      { name: "Clientes Recurrentes", description: "Gestion de clientes recurrentes" },
      { name: "Notificaciones", description: "Gestion de notifications" },
      { name: "Feedbacks", description: "Gestion de feedbacks" },

    ],
    servers: [
      {
        url: process.env.BACK_TEST_SITE_5,
      },
      {
        url: process.env.API_TEST_PROD,
      },

    ],
  },
  apis: [
    "./src/routes/*.js",
    "./src/routes/**/*.js"
  ],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;

