/**
 * @swagger
 * tags:
 *   - name: Super Admin
 *     description: Endpoints para administración de empresas y usuarios (superadmin)
 */

/**
 * @swagger
 * /super/login:
 *   post:
 *     summary: Login de superadmin
 *     tags: [Super Admin]
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
 * /super/refresh:
 *   post:
 *     summary: Refresca el token de superadmin
 *     tags: [Super Admin]
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
 * /super/users:
 *   get:
 *     summary: Lista todos los usuarios
 *     tags: [Super Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *       500:
 *         description: Error interno del servidor
 *   post:
 *     summary: Crea un usuario
 *     tags: [Super Admin]
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
 * /super/companies:
 *   get:
 *     summary: Lista todas las empresas
 *     tags: [Super Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de empresas
 *       500:
 *         description: Error interno del servidor
 *   post:
 *     summary: Crea una empresa
 *     tags: [Super Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *     responses:
 *       201:
 *         description: Empresa creada exitosamente
 *       400:
 *         description: Todos los campos son requeridos
 *       409:
 *         description: El company_unique_id ya existe
 *       500:
 *         description: Error interno del servidor
 */
/**
 * @swagger
 * /super/companies/{company_id}:
 *   post:
 *     summary: Obtiene una empresa por ID
 *     tags: [Super Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: company_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Empresa encontrada
 *       404:
 *         description: Empresa no encontrada
 *       500:
 *         description: Error interno del servidor
 *   put:
 *     summary: Actualiza una empresa por ID
 *     tags: [Super Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: company_id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *     responses:
 *       200:
 *         description: Empresa actualizada
 *       404:
 *         description: Empresa no encontrada
 *       500:
 *         description: Error interno del servidor
 */
const express = require("express");
const CompanyController = require("../controllers/companyController");
const authSuperController = require("../controllers/authSuperController");
const userController = require("../controllers/userController");
const authSuperadmin = require("../middlewares/authSuperadmin");

const router = express.Router();

router.post("/login", authSuperController.login);
router.post("/refresh", authSuperController.refreshToken);

// Users
router.get("/users", authSuperadmin, userController.getAll);
router.post("/users",authSuperadmin, userController.createUser);
router.post("/users/:user_id", authSuperadmin, userController.restoreUser);

// Companies
router.get("/companies", authSuperadmin, CompanyController.getAllCompanies); 
router.post("/companies", authSuperadmin, CompanyController.createCompany);
router.post("/companies/:company_id", authSuperadmin, CompanyController.getCompanyById);
router.put("/companies/:company_id", authSuperadmin, CompanyController.updateCompany);

module.exports = router;
