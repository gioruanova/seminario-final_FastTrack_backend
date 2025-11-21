const express = require("express");
const router = express.Router();

// middleware
const authSuperadmin = require("../middlewares/authSuperadmin");

// controllers
const clienteRecurrenteController = require("../controllers/clientesRecurrentesController");
const especialidadController = require("../controllers/especialidadController");
const profesionalEspecialidadController = require("../controllers/profesionalEspecialidadController");
const reclamoController = require("../controllers/reclamoController");
// =======================
// Middleware global para rutas protegidas
router.use(authSuperadmin);

// =======================
// Rutas protegidas

// Manejo de especialidades
router.get("/especialidades", especialidadController.getAllEspecialidadesAsAdmin);
router.get("/especialidades/:company_id", especialidadController.getAllEspecialidadesByCompanyAsAdmin);

router.post("/especialidades", especialidadController.createEspecialidadAsAdmin);
router.put("/especialidades/:especialidadId", especialidadController.updateEspecialidadAsAdmin);

router.put("/especialidades/block/:especialidadId", especialidadController.disableEspecialidadAsAdmin);
router.put("/especialidades/unblock/:especialidadId", especialidadController.enableEspecialidadAsAdmin);

router.post("/profesionalEspecialidad", profesionalEspecialidadController.assignEspecialidadAsAdmin);
router.delete("/profesionalEspecialidad/:id_asignacion", profesionalEspecialidadController.deleteEspecialidadAsAdmin);
router.put("/profesionalEspecialidad/:id_asignacion", profesionalEspecialidadController.editAsignacionEspecialidadAsAdmin);

// --------------------------------------------------------------------------------------------------------------
// Manejo de clientes recurrentes
// --------------------------------------------------------------------------------------------------------------
router.get("/clientes-recurrentes", clienteRecurrenteController.getAllClientesRecurrentesAsAdmin);

// --------------------------------------------------------------------------------------------------------------
// Reclamos
router.get("/reclamos", reclamoController.getReclamosAsAdmin);
router.get("/reclamos/:company_id", reclamoController.getReclamosByCompanyAsAdmin);



module.exports = router;
