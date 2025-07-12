/**
 * @swagger
 * tags:
 *   - name: Clientes
 *     description: Endpoints para usuarios de empresa
 */

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Login de usuario
 *     tags: [Clientes]
 *     requestBody:
 *       required: true
 *     responses:
 *       200:
 *         description: Login exitoso
 *       400:
 *         description: Email y password son requeridos
 *       401:
 *         description: Credenciales inválidas
 *       500:
 *         description: Error interno del servidor
 */
/**
 * @swagger
 * /refresh:
 *   post:
 *     summary: Refresca el token de usuario
 *     tags: [Clientes]
 *     responses:
 *       200:
 *         description: Token refrescado
 *       400:
 *         description: Refresh token es requerido
 *       401:
 *         description: Refresh token inválido o expirado
 *       500:
 *         description: Error interno del servidor
 */
/**
 * @swagger
 * /users:
 *   get:
 *     summary: Lista usuarios de la empresa
 *     tags: [Clientes]
 *     description: Solo Owners y operadores pueden visualizar esta ruta
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *       500:
 *         description: Error interno del servidor
 *   post:
 *     summary: Crea un usuario en la empresa
 *     tags: [Clientes]
 *     description: Owners solo pueden crear Operadores y Profesionales, mientras que Operadores, solo pueden crear Profesionales
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *     responses:
 *       201:
 *         description: Usuario creado
 *       400:
 *         description: Todos los campos son requeridos / El rol profesional requiere especialidad
 *       409:
 *         description: El email ya está en uso
 *       500:
 *         description: Error interno del servidor
 */
/**
 * @swagger
 * /especialidades:
 *   post:
 *     summary: Crea una especialidad
 *     tags: [Clientes]
 *     description: Solo Owners pueden crear especialidades
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *     responses:
 *       201:
 *         description: Especialidad creada
 *       400:
 *         description: nombre_especialidad es requerido
 *       409:
 *         description: La especialidad ya existe para esta empresa
 *       500:
 *         description: Error interno del servidor
 */
/**
 * @swagger
 * /especialidades/{especialidadId}:
 *   put:
 *     summary: Actualiza una especialidad
 *     description: Solo Owners pueden editar especialidades
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: especialidadId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *     responses:
 *       200:
 *         description: Especialidad actualizada
 *       400:
 *         description: El campo nombre_especialidad es requerido
 *       404:
 *         description: Especialidad no encontrada
 *       409:
 *         description: Ya existe una especialidad con ese nombre
 *       500:
 *         description: Error interno del servidor
 */
/**
 * @swagger
 * /especialidades/{id_usuario}:
 *   post:
 *     summary: Asigna especialidad manualmente a un usuario (cuando hubo algun error o problema)
 *     tags: [Clientes]
 *     description: Solo Owners pueden asignar una especialidad
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_usuario
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *     responses:
 *       200:
 *         description: Especialidad asignada correctamente
 *       400:
 *         description: id_usuario e id_especialidad son requeridos
 *       500:
 *         description: Error interno del servidor
 */
const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const especialidadController = require("../controllers/EspecialidadCreadaController");

// const exportCompanyExcel = require("../controllers/exportToExcelCompany");

const authUserController = require("../controllers/authUserController");
const validateCompanyAndUserStatus = require("../middlewares/validateCompanyAndUserStatus");
const authUser = require("../middlewares/authUser");
const assignCompanyIdAndValidateRole = require("../middlewares/assignCompanyIdAndValidateRole");

router.post("/login", authUserController.login);
router.post("/refresh", authUserController.refreshToken);

router.get("/users", authUser("owner", "operador"), validateCompanyAndUserStatus,userController.getUsersByCompany);
router.post("/users", authUser("owner", "operador"), validateCompanyAndUserStatus,assignCompanyIdAndValidateRole,userController.createUser);
router.post("/users/:user_id", authUser("owner", "operador"), validateCompanyAndUserStatus,userController.restoreUser);

router.post("/especialidades", authUser("owner"), validateCompanyAndUserStatus,especialidadController.createEspecialidad);
router.put("/especialidades/:especialidadId", authUser("owner"), validateCompanyAndUserStatus,especialidadController.updateEspecialidad);
router.post("/especialidades/:id_usuario", authUser("owner"), validateCompanyAndUserStatus,userController.asignarEspecialidadManual);

// router.get("/usersReport", authUser(), validateCompanyAndUserStatus, exportCompanyExcel.exportUsersByCompany);

module.exports = router;
