const express = require("express");
const router = express.Router();
const authUserController = require("../controllers/authUserController");

// Proceso de login a portal clientes
router.post("/login", authUserController.login);
router.get("/refresh", authUserController.refreshToken);
router.get("/logout", authUserController.logout);

module.exports = router;
