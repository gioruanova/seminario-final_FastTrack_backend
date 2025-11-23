const express = require("express");
const router = express.Router();

// middleware
const authSuperadmin = require("../middlewares/authSuperadmin");

// controllers
const clienteRecurrenteController = require("../controllers/clientesRecurrentesController");
const reclamoController = require("../controllers/reclamoController");

router.use(authSuperadmin);

router.get("/clientes-recurrentes", clienteRecurrenteController.getAllClientesRecurrentesAsAdmin);
router.get("/reclamos", reclamoController.getReclamosAsAdmin);
router.get("/reclamos/:company_id", reclamoController.getReclamosByCompanyAsAdmin);

module.exports = router;
