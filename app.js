require("dotenv").config();
const express = require("express");
const swaggerUI = require("swagger-ui-express");
const swaggerSpec = require("./utils/swagger/swaggerConfig");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const port = process.env.PORT || 8888;

const corsOptions = {
  origin: [process.env.BACK_TEST_SITE, process.env.BACK_TEST_SITE_2],
  methods: "GET,PUT,POST,DELETE",
  allowedHeaders: "Content-Type",
};

app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerSpec));

app.use("/super",require("./src/routes/superRoutes"));
app.use(require("./src/routes/userRoutes"));

// 404 fallback
app.use((req, res) => {
  res.status(404).send(`
    <div style="width: 100%;height: 100%;display: flex;justify-content: center;align-items: center;background: #1a1a1a;flex-direction: column;color: white;">
        <h1 style="margin: 0;text-transform: uppercase;font-size: 55px;">Root</h1>
        <a href="/api-docs" style="color: #98c3f1;text-transform: uppercase;text-decoration: none;font-size: 21px;">Check doc</a>
    </div>
  `);
});

app.listen(port, "0.0.0.0", () => {
  console.log(`🚀 Servidor Express escuchando en http://localhost:${port}`);
});
