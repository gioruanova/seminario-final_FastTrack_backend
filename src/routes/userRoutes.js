const express = require("express");
const router = express.Router();

// controladores
const authUserController = require("../controllers/authUserController");
const userController = require("../controllers/userController");
const especialidadController = require("../controllers/especialidadController");

// middelware para usuarios
const validateAccessStatus = require("../middlewares/validateAccessStatus");
const authUser = require("../middlewares/authUser");



// // utilitarios
// const exportCompanyExcel = require("../controllers/exportToExcelCompany");

// =========================================================

// ruta abierta para login y refres
router.post("/login", authUserController.login);
router.post("/refresh", authUserController.refreshToken);

// rutas para manejo de users
router.post("/users",authUser("owner", "operador"),validateAccessStatus,userController.createUserAsClient); // CREATE >>> company condition in controller
router.get("/users",authUser("owner", "operador"),validateAccessStatus,userController.getUsersAsClient); // OBTENER >>> company condition in controller
router.post("/users/block/:user_id",authUser("owner"),validateAccessStatus,userController.blockUserAsClient); // BLOQUEAR >>> company condition in controller
router.post("/users/unblock/:user_id",authUser("owner"),validateAccessStatus,userController.unblockUserAsClient); // DESBLOQUEAR >>> company condition in controller
router.put("/users/restore/:user_id", authUser("owner"), userController.restoreUserAsClient); // RESTAURAR USUARIO CON RESETEO




// rutas para manejo de especialidaes
router.post("/especialidades",authUser("owner"),validateAccessStatus,especialidadController.createEspecialidadAsClient);
router.put("/especialidades/:especialidadId",authUser("owner"),validateAccessStatus,especialidadController.updateEspecialidadAsClient);
router.get("/especialidades",authUser("owner", "operador"),validateAccessStatus,especialidadController.getAllEspecialidades);

// // FEATURES
// router.get("/usersReport", authUser(), validateAccessStatus, exportCompanyExcel.exportUsersByCompany);

module.exports = router;

// =========================================================
// DOCUMENTACION SWAGGER
// =========================================================
