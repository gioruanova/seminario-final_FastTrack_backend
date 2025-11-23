const express = require("express");
const router = express.Router();
const authUserWithStatus = require("../middlewares/authUserWithStatus");
const reclamoController = require("../controllers/reclamoController");
const clientesRecurrentesController = require("../controllers/clientesRecurrentesController");
const agendaReclamoController = require("../controllers/agendaReclamoController");
const disponibilidadController = require("../controllers/disponibilidadController");
const exportReclamosController = require("../../utils/exports/exportReclamosController");
const notificationsController = require("../controllers/NotificationsController");

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
router.post("/reclamo", authUserWithStatus({ roles: ["owner", "operador"] }), reclamoController.createReclamo);
router.get("/reclamos", authUserWithStatus({ roles: ["owner", "operador"] }), reclamoController.getReclamosAsClient);
router.get("/reclamos/gestion/:reclamo_id", authUserWithStatus({ roles: ["owner", "operador"] }), reclamoController.getReclamosAsClientById);
router.put("/reclamos/gestion/:reclamo_id", authUserWithStatus({ roles: ["owner", "operador"] }), reclamoController.updateReclamoAsClient);

router.put("/reclamos/recordatorio/:reclamo_id", authUserWithStatus({ roles: ["owner", "operador"] }), reclamoController.recordatorioReclamo);
router.get("/reclamos/profesional", authUserWithStatus({ roles: ["profesional"] }), reclamoController.getReclamosAsProfesional);
router.get("/reclamos/profesional/gestion/:reclamo_id", authUserWithStatus({ roles: ["profesional"] }), reclamoController.getReclamosAsProfesionalById);
router.put("/reclamos/profesional/gestion/:reclamo_id", authUserWithStatus({ roles: ["profesional"] }), reclamoController.updateReclamoAsProfesional);
router.get("/vistas/reclamos/:status", authUserWithStatus({ roles: ["owner", "operador"] }), exportReclamosController.exportReclamosToExcel);
router.post("/notifications", authUserWithStatus({ roles: ["profesional"] }), notificationsController.registerToken);
router.delete("/notifications", authUserWithStatus({ roles: ["profesional"] }), notificationsController.unregisterToken);
router.post("/send-notifications", authUserWithStatus({ roles: ["profesional"] }), notificationsController.sendNotification);

module.exports = router;
