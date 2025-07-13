const express = require("express");
const router = express.Router();

// middelware para super admin
const authSuperadmin = require("../middlewares/authSuperadmin");
// controllers
const authSuperController = require("../controllers/authSuperController");
const userController = require("../controllers/userController");
const companyController = require("../controllers/companyController");

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

router.post("/users/:user_id", authSuperadmin, userController.restoreUser);

// rutas para manejo de empresas
router.get("/companies", authSuperadmin, companyController.getAllCompanies); 
router.post("/companies", authSuperadmin, companyController.createCompany);
router.post("/companies/:company_id", authSuperadmin, companyController.getCompanyById);
router.put("/companies/:company_id", authSuperadmin, companyController.updateCompany);

module.exports = router;



// =========================================================
// DOCUMENTACION SWAGGER
// =========================================================
