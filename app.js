require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const swaggerUI = require("swagger-ui-express");
const swaggerSpec = require("./utils/swagger/swaggerConfig");

const app = express();
const port = process.env.PORT || 8888;

const corsOptions = {
  origin: [process.env.BACK_TEST_SITE, process.env.BACK_TEST_SITE_2, process.env.BACK_TEST_SITE_3, process.env.BACK_TEST_SITE_4],
  credentials: true,
  methods: "GET,PUT,POST,DELETE",
  allowedHeaders: ["Authorization", "Content-Type"],
  exposedHeaders: ["Content-Disposition"],
};

// =====================================================================
// Middleware
app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const cookieParser = require("cookie-parser");
app.use(cookieParser());

// =====================================================================
// Routes
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerSpec));
app.use("/publicApi", require("./src/routes/publicRoutes"));
app.use("/superApi", require("./src/routes/superRoutes"));
app.use("/customersApi", require("./src/routes/userRoutes"));

// =====================================================================
// 404 fallback
app.use((req, res) => {
  res.status(404).send(`
    <div style="width: 100%;height: 100%;display: flex;justify-content: center;align-items: center;background: #1a1a1a;flex-direction: column;color: white;">
        <h1 style="margin: 0;text-transform: uppercase;font-size: 55px;">Root</h1>
        <a href="/api-docs" style="color: #98c3f1;text-transform: uppercase;text-decoration: none;font-size: 21px;">Check doc</a>
    </div>
  `);
});

// =====================================================================
// Running
app.listen(port, "0.0.0.0", () => {
  console.log(`✅ Server running on http://localhost:${port}`);
});
