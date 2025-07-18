const express = require("express");
const router = express.Router();

// middleware
const authSuperadmin = require("../middlewares/authSuperadmin");

// controllers
const authSuperController = require("../controllers/authSuperController");
const userController = require("../controllers/userController");
const companyController = require("../controllers/companyController");
const especialidadController = require("../controllers/especialidadController");
const profesionalEspecialidadController = require("../controllers/profesionalEspecialidadController");

const publicMessagesController = require("../controllers/cfv/publicMessagesController");
const publicMessageCategoryController = require("../controllers/cfv/publicMessageCategoryController");

const globalLogController = require("../controllers/globalLogController");
const messageController = require("../controllers/messageController");

// =======================
// Rutas publicas
router.post("/login", authSuperController.login);
router.post("/refresh", authSuperController.refreshToken);


// =======================
// Middleware global para rutas protegidas
router.use(authSuperadmin);

// =======================
// Rutas protegidas
// Mensajes publicos
router.get("/messages", publicMessagesController.gettAlMessagesAsAdmin);
router.put("/messages/read/:message_id", publicMessagesController.markMessageAsReadAsAdmin);
router.put("/messages/unread/:message_id", publicMessagesController.markMessageAsUnreadAsAdmin);
router.delete("/messages/:message_id", publicMessagesController.deleteMessageAsAdmin);

// Categorias mensajes publicos
router.get("/messageCategories", publicMessageCategoryController.getAllMessagesCategoriesAsAdmin);
router.post("/messageCategories", publicMessageCategoryController.createMessageCategoryAsAdmin);
router.put("/messageCategories/:category_id", publicMessageCategoryController.updateMessageCategoryAsAdmin);
router.put("/messageCategories/disable/:category_id", publicMessageCategoryController.disableMessageCategoryAsAdmin);
router.put("/messageCategories/enable/:category_id", publicMessageCategoryController.enableMessageCategoryAsAdmin);


router.delete("/messageCategories/:category_id", publicMessageCategoryController.deleteCategoryMessageAsAdmin);





// Manejo de users
router.get("/users", userController.getUsersAsAdmin);
router.get("/users/:company_id", userController.getUsersByCompanyAsAdmin);

router.post("/users", userController.createUserAsAdmin);
router.put("/users/:user_id", userController.editUserAsAdmin);

router.post("/users/block/:user_id", userController.blockUserAsAdmin);
router.post("/users/unblock/:user_id", userController.unblockUserAsAdmin);
router.put("/users/restore/:user_id", userController.restoreUserAsAdmin);

// --------------------------------------------------------------------------------------------------------------
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
// Manejo de empresas
router.get("/companies", companyController.getAllCompanies);
router.post("/companies/:company_id", companyController.getCompanyById);

router.post("/companies", companyController.createCompany);
router.put("/companies/:company_id", companyController.updateCompanyAsAdmin);



// --------------------------------------------------------------------------------------------------------------
// Manejo de Logs
router.get("/globalLogs", globalLogController.getAllLogsAsAdmin);
router.get("/globalLogs/:company_id", globalLogController.getAllLogsByCompanyAsAdmin);


// Mensajes globales
router.post("/platform/messages", messageController.createMessageForAllAsAdmin);
router.post("/platform/messages/company/:company_id", messageController.createMessageForCompanyAsAdmin);
router.post("/platform/messages/user/:user_id", messageController.createMessageForUserAsAdmin);
router.delete("/platform/messages/:platform_message_id", messageController.deleteMessageAsAdmin);



module.exports = router;


// =========================================================
// DOCUMENTACION SWAGGER

