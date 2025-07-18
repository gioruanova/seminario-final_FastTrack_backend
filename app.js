require("dotenv").config();

const express = require("express");

const app = express();
const port = process.env.PORT || 8080;

app.use((req, res, next) => {
  console.log(`Request ${req.method} ${req.url}`);
  next();
});

app.get("/ping", (req, res) => {
  res.status(200).json({ message: "pong" });
});

app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});
