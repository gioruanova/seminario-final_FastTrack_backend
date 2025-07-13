const User = require("../models/User");
const Company = require("../models/Company");
const companyController = require("./companyController");
const userLogController = require("./userLogController");
const especialidadController = require("./especialidadController");
const bcrypt = require("bcrypt");
// const { transaction } = require("objection");
const saltRounds = 10;

// CONTROLADORES PARA ADMIN:
// ---------------------------------------------------------
// Crear usuario como admin
// ---------------------------------------------------------
async function createUserAsAdmin(req, res) {
  const {
    user_complete_name,
    user_dni,
    user_phone,
    user_email,
    user_password,
    user_role,
    company_id,
  } = req.body;

  try {
    const company = await Company.query().findById(company_id);

    if (!company) {
      return res.status(400).json({ error: "No existe empresa bajo ese ID" });
    }

    const existingUser = await User.query().findOne({ user_email });
    if (existingUser) {
      return res.status(400).json({ error: "El email ya está registrado" });
    }

    const newUser = await User.query().insert({
      user_complete_name,
      user_dni,
      user_phone,
      user_email,
      user_password: bcrypt.hashSync(user_password, saltRounds),
      user_role,
      company_id,
    });

    return res
      .status(201)
      .json({ success: true, message: "Usuario creado correctamente" });
  } catch (error) {
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}
// ---------------------------------------------------------
// Obtener todos lo suaurios
// ---------------------------------------------------------
async function getUsersAsAdmin(req, res) {
  try {
    const users = await User.query().select(
      "user_id",
      "user_complete_name",
      "user_dni",
      "user_phone",
      "user_email",
      "user_role",
      "user_status",
      "company_id",
      "created_at",
      "updated_at"
    );

    return res.json(users);
  } catch (error) {
    // console.error("Error al obtener usuarios:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

async function getUsersByCompanyAsAdmin(req, res) {
  const companyId = req.params.company_id;

  try {
    const users = await User.query().where("company_id", companyId);
    return res.json(users);
  } catch (error) {
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

async function blockUserAsAdmin(req, res) {
  const { user_id } = req.params;
  try {
    const userToBlock = await User.query().findById(user_id);
    if (!userToBlock) {
      return res.status(400).json({ error: "No existe usuario bajo ese ID" });
    }
    if (userToBlock.user_status === 0)
      return res.status(400).json({ error: "El usuario ya estaba bloqueado" });

    await bloquearUsuarioPorId(user_id);

    return res
      .status(200)
      .json({ success: true, message: "Usuario bloqueado correctamente" });
  } catch (error) {
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}
async function unblockUserAsAdmin(req, res) {
  const { user_id } = req.params;
  try {
    const userToUnblock = await User.query().findById(user_id);
    if (!userToUnblock) {
      return res.status(400).json({ error: "No existe usuario bajo ese ID" });
    }
    if (userToUnblock.user_status === 1)
      return res
        .status(400)
        .json({ error: "El usuario ya estaba desbloqueado" });
    await desbloquearUsuarioPorId(user_id);
    return res
      .status(200)
      .json({ success: true, message: "Usuario desbloqueado correctamente" });
  } catch (error) {
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

// CONTROLADORES PARA USER
// ---------------------------------------------------------
// Crear usuario como usuario
// ---------------------------------------------------------
async function createUserAsUser(req, res) {
  const creator = req.user;
  let limiteOperadores;
  let currentTotalOperadores;

  let limiteProfesionales;
  let currentTotalProfesionales;
  const company_id = creator.company_id;

  const {
    user_complete_name,
    user_dni,
    user_phone,
    user_email,
    user_password,
    user_role,
  } = req.body;

  try {
    const company = await Company.query().findById(company_id);
    if (!company) {
      return res.status(400).json({ error: "No existe empresa bajo ese ID" });
    }

    const existingUser = await User.query().findOne({ user_email });
    if (existingUser) {
      return res.status(400).json({ error: "El email ya está registrado" });
    }

    if (!canCreateRole(creator.user_role, user_role)) {
      return res
        .status(403)
        .json({ error: "No tenés permiso para crear este tipo de usuario" });
    }

    limiteOperadores = await companyController.getLimitOperator(company_id);
    limiteProfesionales = await companyController.getLimitProfesionales(
      company_id
    );

    currentTotalOperadores = await getCurrentTotalOperadores(company_id);
    currentTotalProfesionales = await getCurrentTotalProfesionales(company_id);

    if (user_role == "operador" && currentTotalOperadores >= limiteOperadores) {
      return res.status(400).json({ error: "Limite de operadores alcanzado" });
    }

    if (
      user_role == "profesional" &&
      currentTotalProfesionales >= limiteProfesionales
    ) {
      return res
        .status(400)
        .json({ error: "Limite de profesionales alcanzado" });
    }

    const newUser = await User.query().insert({
      user_complete_name,
      user_dni,
      user_phone,
      user_email,
      user_password: bcrypt.hashSync(user_password, saltRounds),
      user_role,
      company_id,
    });

    return res
      .status(201)
      .json({ success: true, message: "Usuario creado correctamente" });
  } catch (error) {
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

// ---------------------------------------------------------
// Obtener todos lo suaurios
// ---------------------------------------------------------
async function getUsersByCompany(req, res) {
  const companyId = req.user.company_id;

  try {
    const users = await User.query()
      .select(
        "user_id",
        "user_complete_name",
        "user_dni",
        "user_phone",
        "user_email",
        "user_role",
        "user_status",
        "company_id",
        "created_at",
        "updated_at"
      )
      .where("company_id", companyId)
      .withGraphFetched("especialidades.Especialidad(selectNombreEspecialidad)")
      .modifiers({
        selectNombreEspecialidad(builder) {
          builder.select("nombre_especialidad");
        },
      });

    res.json(users);
  } catch (error) {
    // console.error("Error al obtener usuarios por empresa:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
}

// ---------------------------------------------------------
// HELPERS
// ---------------------------------------------------------
// Logicas para creacion de usuarios
function canCreateRole(creatorRole, newUserRole) {
  const permissions = {
    owner: ["operador", "profesional"],
    operador: ["profesional"],
    profesional: [""],
  };
  return permissions[creatorRole]?.includes(newUserRole);
}

// Obtener total de operadores actual por empresa
async function getCurrentTotalOperadores(company_id) {
  const result = await User.query()
    .where({ company_id, user_role: "operador" })
    .count()
    .first();

  return parseInt(result["count(*)"], 10);
}

// Obtener total de profesionales actual por empresa
async function getCurrentTotalProfesionales(company_id) {
  const result = await User.query()
    .where({ company_id, user_role: "profesional" })
    .count()
    .first();

  return parseInt(result["count(*)"], 10);
}

// ---------------------------------------------------------
// OTROS HELPERS
// ---------------------------------------------------------

// Funcion para bloquear un usuario
async function bloquearUsuarioPorId(user_id) {
  return await User.query().patchAndFetchById(user_id, { user_status: false });
}

async function desbloquearUsuarioPorId(user_id) {
  return await User.query().patchAndFetchById(user_id, { user_status: true });
}

// Funcion para activar un usuario
async function habilitarUsuarioPorId(user_id) {
  await userLogController.deleteLogByYserid(user_id);
  return await User.query().patchAndFetchById(user_id, { user_status: true });
}

async function restoreUser(req, res) {
  try {
    const { user_id } = req.params;

    habilitarUsuarioPorId(user_id);
    return res
      .status(200)
      .json({ success: true, message: "Usuario restaurado correctamente" });
  } catch (error) {
    // console.error("Error al restaurar usuario:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

module.exports = {
  createUserAsAdmin,
  getUsersAsAdmin,
  getUsersByCompanyAsAdmin,
  blockUserAsAdmin,
  unblockUserAsAdmin,

  getUsersByCompany,
  bloquearUsuarioPorId,
  habilitarUsuarioPorId,
  restoreUser,

  createUserAsUser,
};
