const express = require("express");
const router = express.Router();
const clientesRecurrentesController = require("../../controllers/ClientesRecurrentesController");
const authUsers = require("../../middlewares/authUsers");



router.get("/clientes-recurrentes", authUsers({ roles: ["superadmin", "owner", "operador"] }), clientesRecurrentesController.getAllClientesRecurrentes);
router.post("/clientes-recurrentes", authUsers({ roles: ["superadmin", "owner", "operador"] }), clientesRecurrentesController.createClienteRecurrente);
router.put("/clientes-recurrentes/:cliente_id", authUsers({ roles: ["superadmin", "owner", "operador"] }), clientesRecurrentesController.updateClienteRecurrente);
router.put("/clientes-recurrentes/block/:cliente_id", authUsers({ roles: ["superadmin", "owner", "operador"] }), clientesRecurrentesController.blockClienteRecurrente);
router.put("/clientes-recurrentes/unblock/:cliente_id", authUsers({ roles: ["superadmin", "owner", "operador"] }), clientesRecurrentesController.unblockClienteRecurrente);

module.exports = router;

// =========================================================
// DOCUMENTACION SWAGGER
// =========================================================

/**
 * @swagger
 * /clientes-recurrentes:
 *   get:
 *     summary: Obtener clientes recurrentes
 *     description: Obtiene la lista de clientes recurrentes según el rol del usuario autenticado. Superadmin ve todos los clientes recurrentes, Owner/Operador ven solo los de su empresa.
 *     tags:
 *       - Clientes Recurrentes
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de clientes recurrentes obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   cliente_id:
 *                     type: integer
 *                     example: 1
 *                   cliente_complete_name:
 *                     type: string
 *                     example: "Juan Pérez"
 *                   cliente_dni:
 *                     type: string
 *                     example: "12345678"
 *                   cliente_phone:
 *                     type: string
 *                     example: "+54 9 11 1234-5678"
 *                   cliente_email:
 *                     type: string
 *                     format: email
 *                     example: "juan@example.com"
 *                   cliente_direccion:
 *                     type: string
 *                     nullable: true
 *                     example: "Av. Corrientes 1234"
 *                   cliente_lat:
 *                     type: number
 *                     nullable: true
 *                     example: -34.603722
 *                   cliente_lng:
 *                     type: number
 *                     nullable: true
 *                     example: -58.381592
 *                   cliente_status:
 *                     type: integer
 *                     enum: [0, 1]
 *                     description: "0 = Bloqueado, 1 = Activo"
 *                     example: 1
 *                   company_id:
 *                     type: integer
 *                     example: 5
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *                     example: "2024-01-15T10:30:00Z"
 *                   updated_at:
 *                     type: string
 *                     format: date-time
 *                     example: "2024-01-15T10:30:00Z"
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permiso (rol no autorizado)
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /clientes-recurrentes:
 *   post:
 *     summary: Crear cliente recurrente
 *     description: Crea un nuevo cliente recurrente. El dispatcher maneja la lógica según el rol del usuario autenticado. Superadmin puede crear para cualquier empresa, Owner/Operador solo para su empresa.
 *     tags:
 *       - Clientes Recurrentes
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cliente_complete_name
 *               - cliente_dni
 *               - cliente_phone
 *               - cliente_email
 *             properties:
 *               cliente_complete_name:
 *                 type: string
 *                 example: "Juan Pérez"
 *               cliente_dni:
 *                 type: string
 *                 example: "12345678"
 *               cliente_phone:
 *                 type: string
 *                 example: "+54 9 11 1234-5678"
 *               cliente_email:
 *                 type: string
 *                 format: email
 *                 example: "juan@example.com"
 *               cliente_direccion:
 *                 type: string
 *                 description: "Requerido si la empresa requiere domicilio"
 *                 example: "Av. Corrientes 1234"
 *               cliente_lat:
 *                 type: number
 *                 example: -34.603722
 *               cliente_lng:
 *                 type: number
 *                 example: -58.381592
 *               company_id:
 *                 type: integer
 *                 description: "Requerido solo para superadmin"
 *                 example: 5
 *     responses:
 *       201:
 *         description: Cliente recurrente creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Cliente recurrente creado correctamente"
 *       400:
 *         description: Campos requeridos faltantes, datos inválidos o domicilio requerido no proporcionado
 *       409:
 *         description: Ya existe un cliente recurrente con ese DNI o email
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /clientes-recurrentes/{cliente_id}:
 *   put:
 *     summary: Actualizar cliente recurrente
 *     description: Actualiza los datos de un cliente recurrente existente. El dispatcher maneja la lógica según el rol. Superadmin puede editar cualquier cliente recurrente, Owner/Operador solo los de su empresa.
 *     tags:
 *       - Clientes Recurrentes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cliente_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del cliente recurrente
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cliente_complete_name:
 *                 type: string
 *                 example: "Juan Pérez"
 *               cliente_dni:
 *                 type: string
 *                 example: "12345678"
 *               cliente_phone:
 *                 type: string
 *                 example: "+54 9 11 1234-5678"
 *               cliente_email:
 *                 type: string
 *                 format: email
 *                 example: "juan@example.com"
 *               cliente_direccion:
 *                 type: string
 *                 example: "Av. Corrientes 1234"
 *               cliente_lat:
 *                 type: number
 *                 example: -34.603722
 *               cliente_lng:
 *                 type: number
 *                 example: -58.381592
 *     responses:
 *       200:
 *         description: Cliente recurrente actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Cliente recurrente actualizado correctamente"
 *       400:
 *         description: Cliente recurrente no existe, datos inválidos o campos requeridos vacíos
 *       403:
 *         description: Sin permiso para editar este cliente recurrente
 *       409:
 *         description: Ya existe un cliente recurrente con ese DNI o email
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /clientes-recurrentes/block/{cliente_id}:
 *   put:
 *     summary: Bloquear cliente recurrente
 *     description: Bloquea un cliente recurrente. El dispatcher maneja la lógica según el rol. Superadmin puede bloquear cualquier cliente recurrente, Owner/Operador solo los de su empresa.
 *     tags:
 *       - Clientes Recurrentes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cliente_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del cliente recurrente
 *         example: 1
 *     responses:
 *       200:
 *         description: Cliente recurrente bloqueado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Cliente recurrente bloqueado correctamente"
 *       400:
 *         description: Cliente recurrente no existe o ya estaba bloqueado
 *       403:
 *         description: Sin permiso para bloquear este cliente recurrente
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /clientes-recurrentes/unblock/{cliente_id}:
 *   put:
 *     summary: Desbloquear cliente recurrente
 *     description: Desbloquea un cliente recurrente bloqueado. El dispatcher maneja la lógica según el rol. Superadmin puede desbloquear cualquier cliente recurrente, Owner/Operador solo los de su empresa.
 *     tags:
 *       - Clientes Recurrentes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cliente_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del cliente recurrente
 *         example: 1
 *     responses:
 *       200:
 *         description: Cliente recurrente desbloqueado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Cliente recurrente desbloqueado correctamente"
 *       400:
 *         description: Cliente recurrente no existe o ya estaba desbloqueado
 *       403:
 *         description: Sin permiso para desbloquear este cliente recurrente
 *       500:
 *         description: Error interno del servidor
 */