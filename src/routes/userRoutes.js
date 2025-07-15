const express = require("express");
const router = express.Router();

// middelware para usuarios
const authUserWithStatus = require("../middlewares/authUserWithStatus");

// controladores
const authUserController = require("../controllers/authUserController");
const userController = require("../controllers/userController");
const especialidadController = require("../controllers/especialidadController");
const profesionalEspecialidadController = require("../controllers/profesionalEspecialidadController");

const globalLogController = require("../controllers/globalLogController");



// // utilitarios
// const exportCompanyExcel = require("../controllers/exportToExcelCompany");



// =======================
// Rutas publicas
router.post("/login", authUserController.login);
router.post("/refresh", authUserController.refreshToken);

// =======================
// Rutas protegidas
// Manejo de users
router.get("/users",authUserWithStatus("owner", "operador"),userController.getUsersAsClient);

router.post("/users",authUserWithStatus("owner", "operador"),userController.createUserAsClient);
// crear aca endpoint para editar usuario con logica de no poder cambiar rol (exigir nueva creacion)

router.post("/users/block/:user_id",authUserWithStatus("owner"),userController.blockUserAsClient);
router.post("/users/unblock/:user_id",authUserWithStatus("owner"),userController.unblockUserAsClient);
router.put("/users/restore/:user_id",authUserWithStatus("owner"),userController.restoreUserAsClient);

// --------------------------------------------------------------------------------------------------------------
// Manejo de especialidades
router.get("/especialidades",authUserWithStatus("owner", "operador"),especialidadController.getAllEspecialidades);

router.post("/especialidades",authUserWithStatus("owner"),especialidadController.createEspecialidadAsClient);
router.put("/especialidades/:especialidadId",authUserWithStatus("owner"),especialidadController.updateEspecialidadAsClient);

router.put("/especialidades/block/:especialidadId",authUserWithStatus("owner"),especialidadController.disableEspecialidadAsClient);
router.put("/especialidades/unblock/:especialidadId",authUserWithStatus("owner"),especialidadController.enableEspecialidadAsClient);

router.post("/profesionalEspecialidad",authUserWithStatus("owner", "operador"), profesionalEspecialidadController.assignEspecialidadAsClient);
router.delete("/profesionalEspecialidad/:id_asignacion",authUserWithStatus("owner", "operador"), profesionalEspecialidadController.deleteEspecialidadAsClient);
router.put("/profesionalEspecialidad/:id_asignacion",authUserWithStatus("owner", "operador"), profesionalEspecialidadController.editAsignacionEspecialidadAsClient);



// --------------------------------------------------------------------------------------------------------------
// // Manejo de features especiales
// router.get("/usersReport", authUserWithStatus(),exportCompanyExcel.exportUsersByCompany);



// --------------------------------------------------------------------------------------------------------------
// Manejo de Logs
router.get("/globalLogs",authUserWithStatus("owner"), globalLogController.getAllLogsAsClient);
router.put("/globalLogs/read",authUserWithStatus("owner"), globalLogController.markAllLogsAsReadAsClient);
router.put("/globalLogs/unread",authUserWithStatus("owner"), globalLogController.markAllLogsAsUnreadAsClient);
router.delete("/globalLogs",authUserWithStatus("owner"), globalLogController.deleteLogsAsClient);

module.exports = router;

// =========================================================
// DOCUMENTACION SWAGGER

