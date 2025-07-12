const swaggerJSDoc = require("swagger-jsdoc");
require("dotenv").config();

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Fast Track API",
      version: "1.0.1",
      description: "Fast Track - API docs",
    },
    tags: [{ name: "Super Admin" }, { name: "Clientes" }],
    servers: [
      {
        url: process.env.BACK_TEST_SITE,
      },
      {
        url: process.env.BACK_TEST_SITE_2,
      },
    ],
  },
  apis: ["./src/routes/*.js"],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
