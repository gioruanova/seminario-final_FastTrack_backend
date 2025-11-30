require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const swaggerUI = require("swagger-ui-express");
const swaggerSpec = require("./utils/swagger/swaggerConfig");

const app = express();
const port = process.env.PORT || 8888;

// =====================================================================
const requiredEnvVars = [
  'DB_HOST',
  'DB_NAME',
  'DB_USER',
  'ACCESS_TOKEN_SECRET',
  'REFRESH_TOKEN_SECRET'
];

const missingEnvVars = requiredEnvVars.filter(varName => {
  const value = process.env[varName];
  return !value || value.trim() === '';
});

if (missingEnvVars.length > 0) {
  console.error('❌ Missing or empty required environment variables:');
  missingEnvVars.forEach(varName => console.error(`   - ${varName}`));
  process.exit(1);
}

// ====================================================================
const corsOptions = {
  origin: [
    process.env.BACK_TEST_SITE,
    process.env.BACK_TEST_SITE_2,
    process.env.BACK_TEST_SITE_3,
    process.env.BACK_TEST_SITE_4,
    process.env.BACK_TEST_SITE_5,

  ].filter(Boolean),
  credentials: true,
  methods: ["GET", "PUT", "POST", "DELETE"],
  allowedHeaders: ["Authorization", "Content-Type"],
  exposedHeaders: ["Content-Disposition"],
};

// =====================================================================
app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

// =====================================================================
app.get("/", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Fast Track API is running",
    version: "2.0.5",
    endpoints: {
      docs: `http://localhost:${port}/api-docs`,
      public: `http://localhost:${port}/`
    }
  });
});

// =====================================================================
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerSpec, {
  swaggerOptions: {
    docExpansion: 'none',
    defaultModelsExpandDepth: -1,
    filter: true,
  }
}));


// =====================================================================
const configureRoutes = require("./src/routes");
configureRoutes(app);


// =====================================================================
app.use((req, res) => {
  res.status(404).send(`
    <div style="width: 100%;height: 100%;display: flex;justify-content: center;align-items: center;background: #1a1a1a;flex-direction: column;color: white;">
        <h1 style="margin: 0;text-transform: uppercase;font-size: 55px;">Fast Track</h1>
        <p style="margin: 0;text-transform: capitalize;font-size: 30px;">Soluciones Digitales</p>
    </div>
  `);
});

// =====================================================================
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// =====================================================================
app.listen(port, "0.0.0.0", () => {
  console.log(`✅ Server running on http://localhost:${port}`);
  console.log(`✅ API Docs running on http://localhost:${port}/api-docs`);
});

// =====================================================================
process.on('SIGTERM', () => {
  console.log('⚠️  SIGTERM received. Closing HTTP server gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n⚠️  SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

