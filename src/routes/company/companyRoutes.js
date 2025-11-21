const express = require("express");
const router = express.Router();
const companyController = require("../../controllers/companyController");
const configController = require("../../controllers/ConfigController");
const authUsers = require("../../middlewares/authUsers");
const authUserWithStatus = require("../../middlewares/authUserWithStatus");

router.get("/companies", authUsers({ roles: ["superadmin", "owner"] }), companyController.getCompanies);
router.get("/companies/config", authUserWithStatus({ roles: ["owner", "operador", "profesional"], skipCompanyCheck: true }), configController.getCompanyConfig);
router.get("/companies/:company_id", authUsers({ roles: ["superadmin"] }), companyController.getCompanyById);
router.post("/companies", authUsers({ roles: ["superadmin"] }), companyController.createCompany);
router.put("/companies/config", authUserWithStatus({ roles: ["owner"] }), configController.updateCompanyConfig);
router.put("/companies", authUsers({ roles: ["owner"] }), companyController.updateCompany);
router.put("/companies/:company_id", authUsers({ roles: ["superadmin"] }), companyController.updateCompany);

module.exports = router;

// =========================================================
// DOCUMENTACION SWAGGER
// =========================================================

/**
 * @swagger
 * tags:
 *   name: Company
 *   description: Gestión de empresas
 */

/**
 * @swagger
 * /companies:
 *   get:
 *     summary: Obtener empresas (dispatcher según rol)
 *     tags: [Company]
 *     security:
 *       - cookieAuth: []
 *     description: |
 *       - **Superadmin**: Lista todas las empresas
 *       - **Owner**: Obtiene su propia empresa
 *     responses:
 *       200:
 *         description: Lista de empresas (superadmin) o empresa propia (owner)
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: array
 *                   items:
 *                     $ref: '#/components/schemas/Company'
 *                 - $ref: '#/components/schemas/Company'
 *       403:
 *         description: Rol no autorizado
 *       404:
 *         description: Empresa no encontrada (owner)
 */
/**
 * @swagger
 * /companies:
 *   put:
 *     summary: Actualizar empresa propia (solo owner)
 *     tags: [Company]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               company_phone:
 *                 type: string
 *               company_email:
 *                 type: string
 *                 format: email
 *               company_whatsapp:
 *                 type: string
 *               company_telegram:
 *                 type: string
 *     responses:
 *       200:
 *         description: Empresa actualizada exitosamente
 *       400:
 *         description: Campos inválidos
 *       403:
 *         description: Rol no autorizado
 *       404:
 *         description: Empresa no encontrada
 *       409:
 *         description: Email ya registrado
 */
/**
 * @swagger
 * /companies/{company_id}:
 *   get:
 *     summary: Obtener empresa por ID (solo superadmin)
 *     tags: [Company]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: company_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Información de la empresa
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Company'
 *       403:
 *         description: Rol no autorizado
 *       404:
 *         description: Empresa no encontrada
 */
/**
 * @swagger
 * /companies:
 *   post:
 *     summary: Crear empresa (solo superadmin)
 *     tags: [Company]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - company_unique_id
 *               - company_nombre
 *               - company_phone
 *               - company_email
 *             properties:
 *               company_unique_id:
 *                 type: string
 *               company_nombre:
 *                 type: string
 *               company_phone:
 *                 type: string
 *               company_email:
 *                 type: string
 *                 format: email
 *               limite_operadores:
 *                 type: integer
 *               limite_profesionales:
 *                 type: integer
 *               limite_especialidades:
 *                 type: integer
 *               reminder_manual:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Empresa creada exitosamente
 *       400:
 *         description: Campos inválidos
 *       403:
 *         description: Rol no autorizado
 *       409:
 *         description: Email o unique_id ya registrado
 */
/**
 * @swagger
 * /companies/{company_id}:
 *   put:
 *     summary: Actualizar empresa (solo superadmin)
 *     tags: [Company]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: company_id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               company_unique_id:
 *                 type: string
 *               company_nombre:
 *                 type: string
 *               company_phone:
 *                 type: string
 *               company_email:
 *                 type: string
 *                 format: email
 *               company_whatsapp:
 *                 type: string
 *               company_telegram:
 *                 type: string
 *               company_estado:
 *                 type: boolean
 *               limite_operadores:
 *                 type: integer
 *               limite_profesionales:
 *                 type: integer
 *               limite_especialidades:
 *                 type: integer
 *               reminder_manual:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Empresa actualizada exitosamente
 *       400:
 *         description: Campos inválidos
 *       403:
 *         description: Rol no autorizado
 *       404:
 *         description: Empresa no encontrada
 *       409:
 *         description: Email o unique_id ya registrado
 */

/**
 * @swagger
 * tags:
 *   name: Company Config
 *   description: Configuración de empresas
 */

/**
 * @swagger
 * /companies/config:
 *   get:
 *     summary: Obtener configuración de empresa propia
 *     tags: [Company Config]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Configuración de la empresa
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CompanyConfig'
 *       403:
 *         description: Rol no autorizado
 *       404:
 *         description: Configuración no encontrada
 */
/**
 * @swagger
 * /companies/config:
 *   put:
 *     summary: Actualizar configuración de empresa propia (solo owner)
 *     tags: [Company Config]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sing_heading_owner:
 *                 type: string
 *               sing_heading_profesional:
 *                 type: string
 *               sing_heading_operador:
 *                 type: string
 *               sing_heading_solicitante:
 *                 type: string
 *               sing_heading_reclamos:
 *                 type: string
 *               sing_heading_especialidad:
 *                 type: string
 *               string_inicio_reclamo_solicitante:
 *                 type: string
 *               string_recordatorio_reclamo_solicitante:
 *                 type: string
 *               string_cierre_reclamo_solicitante:
 *                 type: string
 *               string_inicio_reclamo_profesional:
 *                 type: string
 *               string_recordatorio_reclamo_profesional:
 *                 type: string
 *               string_cierre_reclamo_profesional:
 *                 type: string
 *               requiere_domicilio:
 *                 type: boolean
 *               requiere_url:
 *                 type: boolean
 *               requiere_fecha_final:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Configuración actualizada exitosamente
 *       400:
 *         description: Campos inválidos o vacíos
 *       403:
 *         description: Rol no autorizado
 *       404:
 *         description: Configuración no encontrada
 */

