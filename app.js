require("dotenv").config();
const express = require("express");

const app = express();
const port = process.env.PORT || 8888;

app.get("/ping", (req, res) => {
  res.send("pong");
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Server up on port ${port}`);
});
