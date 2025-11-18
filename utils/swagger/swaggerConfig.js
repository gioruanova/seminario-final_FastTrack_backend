const swaggerJSDoc = require("swagger-jsdoc");
require("dotenv").config();

const options = {
  definition: {
    openapi: "3.1.0",
    info: {
      title: "Fast Track API",
      version: "1.0.1",
      description: "Admin-Client-Public API documentation",
    },
    tags: [
      { name: "Public API - LOGIN", description: "Endpoints públicos sin autenticación" },
      
      { name: "SuperAdmin API - EMPRESAS", description: "Gestión de empresas del sistema" },
      { name: "SuperAdmin API - USUARIOS", description: "Gestión global de usuarios" },
      { name: "SuperAdmin API - ESPECIALIDADES", description: "Gestión global de especialidades y asignaciones" },
      { name: "SuperAdmin API - CLIENTES RECURRENTES", description: "Gestión de clientes recurrentes" },
      { name: "SuperAdmin API - RECLAMOS", description: "Gestión global de reclamos" },

      { name: "Customer API - EMPRESA", description: "Gestión de información y configuración de la empresa" },
      { name: "Customer API - USUARIOS", description: "Gestión de usuarios de la empresa" },
      { name: "Customer API - ESPECIALIDADES", description: "Gestión de especialidades y asignaciones" },
      { name: "Customer API - CLIENTES RECURRENTES", description: "Gestión de clientes recurrentes" },
      { name: "Customer API - AGENDA", description: "Gestión de agenda y bloqueos" },
      { name: "Customer API - RECLAMOS", description: "Gestión de reclamos" },
      { name: "Customer API - WORKLOAD", description: "Fila de trabajo de profesionales" },
      { name: "Customer API - FEEDBACK", description: "Envío de feedback a la plataforma" },
      { name: "Customer API - EXPORTACIONES", description: "Exportación de datos a Excel" },
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
  apis: ["./src/routes/*.js"],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;

