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
      { name: "Public API - MENSAJES PUBLICOS", description: "Endpoints públicos manejo de mensajes en sitio institucional" },
      
      { name: "SuperAdmin API - EMPRESAS", description: "Gestión de empresas del sistema" },
      { name: "SuperAdmin API - USUARIOS", description: "Gestión global de usuarios" },
      { name: "SuperAdmin API - ESPECIALIDADES", description: "Gestión global de especialidades y asignaciones" },
      { name: "SuperAdmin API - CLIENTES RECURRENTES", description: "Gestión de clientes recurrentes" },
      { name: "SuperAdmin API - RECLAMOS", description: "Gestión global de reclamos" },
      { name: "SuperAdmin API - MENSAJES PÚBLICOS", description: "Gestión de mensajes públicos recibidos" },
      { name: "SuperAdmin API - CATEGORÍAS DE MENSAJES", description: "Gestión de categorías de mensajes" },
      { name: "SuperAdmin API - LOGS GLOBALES", description: "Logs del sistema" },
      { name: "SuperAdmin API - MENSAJES DE PLATAFORMA", description: "Mensajes internos de la plataforma" },
      { name: "SuperAdmin API - BANNERS", description: "Manejo de banners de la plataforma" },
      { name: "SuperAdmin API - PUSH", description: "Manejo de notificaciones desde la plataforma" },

      { name: "Customer API - EMPRESA", description: "Gestión de información y configuración de la empresa" },
      { name: "Customer API - USUARIOS", description: "Gestión de usuarios de la empresa" },
      { name: "Customer API - ESPECIALIDADES", description: "Gestión de especialidades y asignaciones" },
      { name: "Customer API - CLIENTES RECURRENTES", description: "Gestión de clientes recurrentes" },
      { name: "Customer API - AGENDA", description: "Gestión de agenda y bloqueos" },
      { name: "Customer API - RECLAMOS", description: "Gestión de reclamos" },
      { name: "Customer API - WORKLOAD", description: "Fila de trabajo de profesionales" },
      { name: "Customer API - LOGS", description: "Logs de la empresa" },
      { name: "Customer API - FEEDBACK", description: "Envío de feedback a la plataforma" },
      { name: "Customer API - MENSAJES DE PLATAFORMA", description: "Mensajes internos de la plataforma" },
      { name: "Customer API - EXPORTACIONES", description: "Exportación de datos a Excel" },
      { name: "Customer API - BANNERS", description: "Lectura de banners de la plataforma" },
      { name: "Customer API - PUSH", description: "Manejo de notificaciones desde la plataforma" },
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

