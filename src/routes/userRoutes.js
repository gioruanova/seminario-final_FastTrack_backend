const express = require("express");
const router = express.Router();

// middelware para usuarios
const authUserWithStatus = require("../middlewares/authUserWithStatus");


const especialidadController = require("../controllers/especialidadController");
const profesionalEspecialidadController = require("../controllers/profesionalEspecialidadController");

const reclamoController = require("../controllers/reclamoController");
const clientesRecurrentesController = require("../controllers/clientesRecurrentesController");
const agendaReclamoController = require("../controllers/agendaReclamoController");
const disponibilidadController = require("../controllers/disponibilidadController");


// utilitarios
const exportReclamosController = require("../../utils/exports/exportReclamosController");
const notificationsController = require("../controllers/NotificationsController");

// =======================
// Rutas protegidas


// Manejo de especialidades
router.get("/especialidades", authUserWithStatus({ roles: ["owner", "operador"] }), especialidadController.getAllEspecialidades);

router.post("/especialidades", authUserWithStatus({ roles: ["owner"] }), especialidadController.createEspecialidadAsClient);
router.put("/especialidades/:especialidadId", authUserWithStatus({ roles: ["owner"] }), especialidadController.updateEspecialidadAsClient);

router.put("/especialidades/block/:especialidadId", authUserWithStatus({ roles: ["owner"] }), especialidadController.disableEspecialidadAsClient);
router.put("/especialidades/unblock/:especialidadId", authUserWithStatus({ roles: ["owner"] }), especialidadController.enableEspecialidadAsClient);

router.post("/profesionalEspecialidad", authUserWithStatus({ roles: ["owner", "operador"] }), profesionalEspecialidadController.assignEspecialidadAsClient);

router.get("/asignaciones", authUserWithStatus({ roles: ["owner", "operador"] }), profesionalEspecialidadController.getProfesionalEspecialidadAsClient);

router.delete("/profesionalEspecialidad/:id_asignacion", authUserWithStatus({ roles: ["owner", "operador"] }), profesionalEspecialidadController.deleteEspecialidadAsClient);
router.put("/profesionalEspecialidad/:id_asignacion", authUserWithStatus({ roles: ["owner", "operador"] }), profesionalEspecialidadController.editAsignacionEspecialidadAsClient);

// Manejo de clientes recurrentes
router.get("/clientes-recurrentes", authUserWithStatus({ roles: ["owner", "operador"] }), clientesRecurrentesController.getAllClientesRecurrentesAsClient);

router.post("/clientes-recurrentes", authUserWithStatus({ roles: ["owner", "operador"] }), clientesRecurrentesController.createClienteRecurrenteAsClient);

// TODO: Documentar endpoint
router.put("/clientes-recurrentes/:cliente_id", authUserWithStatus({ roles: ["owner", "operador"] }), clientesRecurrentesController.editarClienteAsClient);

// TODO: Documentar endpoint
router.put("/clientes-recurrentes/unblock/:cliente_id", authUserWithStatus({ roles: ["owner", "operador"] }), clientesRecurrentesController.activarClienteAsClient);

// TODO: Documentar endpoint
router.put("/clientes-recurrentes/block/:cliente_id", authUserWithStatus({ roles: ["owner", "operador"] }), clientesRecurrentesController.desactivarClienteAsClient);

router.get("/reclamos/agendaReclamo", authUserWithStatus({ roles: ["owner", "operador"] }), agendaReclamoController.getAgendaReclamo);
router.post("/disponibilidad/:user_id", authUserWithStatus({ roles: ["owner", "operador"] }), disponibilidadController.getDisponibilidadBloqueadaByProfesioanlAsAdmin);

// Reclamos como owner / operador
router.post("/reclamo", authUserWithStatus({ roles: ["owner", "operador"] }), reclamoController.createReclamo);
router.get("/reclamos", authUserWithStatus({ roles: ["owner", "operador"] }), reclamoController.getReclamosAsClient);
router.get("/reclamos/gestion/:reclamo_id", authUserWithStatus({ roles: ["owner", "operador"] }), reclamoController.getReclamosAsClientById);
router.put("/reclamos/gestion/:reclamo_id", authUserWithStatus({ roles: ["owner", "operador"] }), reclamoController.updateReclamoAsClient);

router.put("/reclamos/recordatorio/:reclamo_id", authUserWithStatus({ roles: ["owner", "operador"] }), reclamoController.recordatorioReclamo);

// Reclamos como profesional
router.get("/reclamos/profesional", authUserWithStatus({ roles: ["profesional"] }), reclamoController.getReclamosAsProfesional);
router.get("/reclamos/profesional/gestion/:reclamo_id", authUserWithStatus({ roles: ["profesional"] }), reclamoController.getReclamosAsProfesionalById);
router.put("/reclamos/profesional/gestion/:reclamo_id", authUserWithStatus({ roles: ["profesional"] }), reclamoController.updateReclamoAsProfesional);

// --------------------------------------------------------------------------------------------------------------
// Manejo de features especiales
// VISTAS
router.get("/vistas/reclamos/:status", authUserWithStatus({ roles: ["owner", "operador"] }), exportReclamosController.exportReclamosToExcel);


// =========================================================
// Notificaciones para mobile
router.post("/notifications", authUserWithStatus({ roles: ["profesional"] }), notificationsController.registerToken);
router.delete("/notifications", authUserWithStatus({ roles: ["profesional"] }), notificationsController.unregisterToken);
router.post("/send-notifications", authUserWithStatus({ roles: ["profesional"] }), notificationsController.sendNotification);


module.exports = router;
