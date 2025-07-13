const express = require("express");
const router = express.Router();

// middelware para super admin
const authSuperadmin = require("../middlewares/authSuperadmin");

// controllers
const authSuperController = require("../controllers/authSuperController");
const userController = require("../controllers/userController");
const companyController = require("../controllers/companyController");
const especialidadController = require("../controllers/especialidadController");

// =========================================================

// ruta abierta para login y refres
router.post("/login", authSuperController.login);
router.post("/refresh", authSuperController.refreshToken);

// rutas para manejo de users
router.post("/users",authSuperadmin, userController.createUserAsAdmin);  // CREAR USUARIO
router.get("/users", authSuperadmin, userController.getUsersAsAdmin); // OBTENER USUARIOS
router.get("/users/:company_id", authSuperadmin, userController.getUsersByCompanyAsAdmin); // OBTENER USUARIOS DE UNA EMPRESA
router.post("/users/block/:user_id", authSuperadmin, userController.blockUserAsAdmin); // BLOQUEAR USUARIO POR ID
router.post("/users/unblock/:user_id", authSuperadmin, userController.unblockUserAsAdmin); // DESBLOQUEAR USUARIO POR ID
router.put("/users/restore/:user_id", authSuperadmin, userController.restoreUserAsAdmin); // RESTAURAR USUARIO CON RESETEO

// rutas para manejo de especialidades
router.get("/especialidades",authSuperadmin,especialidadController.getAllEspecialidadesAsAdmin); // TRAE TODAS LAS ESPECIALIDADES
router.get("/especialidades/:company_id",authSuperadmin,especialidadController.getAllEspecialidadesByCompanyAsAdmin); // TRAE TODAS LAS ESPECIALIDADES POR EMPRESA
router.post("/especialidades", authSuperadmin, especialidadController.createEspecialidadAsAdmin); // CREA ESPECIALIDAD SIN RESTRICCIONES
router.put("/especialidades/:especialidadId",authSuperadmin,especialidadController.updateEspecialidadAsAdmin); // ATUALIZA CUALQUIER ESPECIALIDAD
router.put("/especialidades/block/:especialidadId",authSuperadmin,especialidadController.disableEspecialidadAsAdmin); // ATUALIZA CUALQUIER ESPECIALIDAD
router.put("/especialidades/unblock/:especialidadId",authSuperadmin,especialidadController.enableEspecialidadAsAdmin); // ATUALIZA CUALQUIER ESPECIALIDAD




// rutas para manejo de empresas
router.get("/companies", authSuperadmin, companyController.getAllCompanies); 
router.post("/companies", authSuperadmin, companyController.createCompany);
router.post("/companies/:company_id", authSuperadmin, companyController.getCompanyById);
router.put("/companies/:company_id", authSuperadmin, companyController.updateCompany);

module.exports = router;



// =========================================================
// DOCUMENTACION SWAGGER
// =========================================================
