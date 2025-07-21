const express = require("express");
const router = express.Router();

// middelware para usuarios
const authUserWithStatus = require("../middlewares/authUserWithStatus");

// controladores
const authUserController = require("../controllers/authUserController");
const userController = require("../controllers/userController");

const companyController = require("../controllers/companyController");
const companyConfigController = require("../controllers/companyConfigController");
const especialidadController = require("../controllers/especialidadController");
const profesionalEspecialidadController = require("../controllers/profesionalEspecialidadController");

const reclamoController = require("../controllers/reclamoController");
const clientesRecurrentesController = require("../controllers/clientesRecurrentesController");
const agendaBloquedaController = require("../controllers/agendaBloquedaController");
const disponibilidadController = require("../controllers/disponibilidadController");

const globalLogController = require("../controllers/globalLogController");
const publicMEssageController = require("../controllers/cfv/publicMessagesController");
const messageController = require("../controllers/messageController");

// // utilitarios
const exportProfesionalesController = require("../../utils/exports/exportProfesionalesController");
const exportReclamosController = require("../../utils/exports/exportReclamosController");



// =======================
// Rutas publicas
router.post("/login", authUserController.login);
router.post("/refresh", authUserController.refreshToken);

// =======================
// Rutas protegidas
// Manejo de company
router.get("/company/companyInfo",authUserWithStatus("owner"),companyController.getCompanyInfoAsClientForOnwer);
router.get("/company/companyStatus",authUserWithStatus("owner"),companyConfigController.getCompanySettingsByClientForOwner);
router.get("/company/config",authUserWithStatus("owner", "operador", "profesional"),companyConfigController.getCompanySettingsByClient);
router.put("/company",authUserWithStatus("owner"),companyController.updateCompanyAsClient);
router.put("/company/config",authUserWithStatus("owner"),companyConfigController.updateCompanySettingsByClient);

// Manejo de users
router.get("/users",authUserWithStatus("owner", "operador"),userController.getUsersAsClient);

router.post("/users",authUserWithStatus("owner", "operador"),userController.createUserAsClient);
router.put("/users/:user_id", authUserWithStatus("owner", "operador"),userController.editUserAsClient);

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


// Manejo de clientes recurrentes
router.get("/clientes-recurrentes",authUserWithStatus("owner", "operador"),clientesRecurrentesController.getAllClientesRecurrentesAsClient);
router.post("/clientes-recurrentes",authUserWithStatus("owner", "operador"),clientesRecurrentesController.createClienteRecurrenteAsClient);


// Bloqueo de horarios en agenda
router.get("/agenda",authUserWithStatus("owner", "operador"),agendaBloquedaController.getAllAgendaBloqueadaAsClient);
router.post("/agendaBloqueada/:user_id",authUserWithStatus("owner", "operador"),disponibilidadController.getDisponibilidadBloqueadaByProfesioanlAsAdmin);
router.post("/agenda/:user_id",authUserWithStatus("owner", "operador"),agendaBloquedaController.createAgendaBloqueadaAsClient);

// Reclamos como owner / operador
router.post("/reclamo",authUserWithStatus("owner", "operador"),reclamoController.createReclamo);
router.get("/reclamos", authUserWithStatus("owner", "operador"),reclamoController.getReclamosAsClient);
router.get("/reclamos/gestion/:reclamo_id", authUserWithStatus("owner", "operador"),reclamoController.getReclamosAsClientById);
router.put("/reclamos/gestion/:reclamo_id", authUserWithStatus("owner", "operador"),reclamoController.updateReclamoAsClient);



// Reclamos como profesional
router.get("/reclamos/profesional", authUserWithStatus("profesional"),reclamoController.getReclamosAsProfesional);
router.get("/reclamos/profesional/gestion/:reclamo_id", authUserWithStatus("profesional"),reclamoController.getReclamosAsProfesionalById);
router.put("/reclamos/profesional/gestion/:reclamo_id", authUserWithStatus("profesional"),reclamoController.updateReclamoAsProfesional);


// bloqueo manual de agenda
router.post("/profesional/agenda",authUserWithStatus("profesional"),agendaBloquedaController.createAgendaBloqueadaAsProfesional);
router.get("/agenda/vista/profesional",authUserWithStatus("owner", "operador"),agendaBloquedaController.getAllAgendaBloqueadaAsProfesional);

// deshabilita/habilita la poisibilidad de recibir trabajo
router.put("/workload/enable",authUserWithStatus("profesional"),userController.enableReceiveWork);
router.put("/workload/disable",authUserWithStatus("profesional"),userController.disableReceiveWork);



// --------------------------------------------------------------------------------------------------------------
// Manejo de Logs
router.get("/globalLogs",authUserWithStatus("owner"), globalLogController.getAllLogsAsClient);
router.put("/globalLogs/read",authUserWithStatus("owner"), globalLogController.markAllLogsAsReadAsClient);
router.put("/globalLogs/unread",authUserWithStatus("owner"), globalLogController.markAllLogsAsUnreadAsClient);
router.delete("/globalLogs",authUserWithStatus("owner"), globalLogController.deleteLogsAsClient);


// Feedback
router.post("/platform/feedback",authUserWithStatus("owner", "operador", "profesional"), publicMEssageController.createFeedbackMessage);


// Mensajes globales
router.get("/platform/messages",authUserWithStatus("owner", "operador", "profesional"), messageController.getAllMesagesAsClient);
router.post("/platform/messages",authUserWithStatus("owner", "operador"), messageController.createMessageForCompanyAsClient);
router.post("/platform/messages/user/:user_id",authUserWithStatus("owner", "operador"), messageController.createMessageForUserAsClient);
router.delete("/platform/messages/:platform_message_id",authUserWithStatus("owner"), messageController.deleteCompanyMessagesAsClient);
router.delete("/platform/single-message/:specific_message_id",authUserWithStatus("owner", "operador", "profesional"), messageController.deleteSpecificMessagesAsClient);

router.put('/platform/message/read/:specific_message_id',authUserWithStatus("owner", "operador", "profesional"), messageController.marAsReadMessageAsClient);
router.put('/platform/message/unread/:specific_message_id',authUserWithStatus("owner", "operador", "profesional"), messageController.marAsUnreadMessageAsClient);

// --------------------------------------------------------------------------------------------------------------
// Manejo de features especiales
// VISTAS
router.get("/vistas/profesionales",authUserWithStatus("owner", "operador"),exportProfesionalesController.exportProfesionalesToExcel);
router.get("/vistas/reclamos",authUserWithStatus("owner", "operador"),exportReclamosController.exportReclamosToExcel);





module.exports = router;

// =========================================================
// DOCUMENTACION SWAGGER

