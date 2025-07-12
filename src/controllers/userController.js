const User = require("../models/User");
const UserLog = require("../models/UserLog");
const UserLogController = require("../controllers/UserLogController");
const ProfesionaleSespecialidad = require("../models/ProfesionalesEspecialidad");
const bcrypt = require("bcrypt");
// const { transaction } = require("objection");
const saltRounds = 10;

async function getAll(req, res) {
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
      .withGraphFetched(
        "especialidades.especialidadCreada(selectNombreEspecialidad)"
      )
      .modifiers({
        selectNombreEspecialidad(builder) {
          builder.select("nombre_especialidad");
        },
      });

    return res.json(users);
  } catch (error) {
    // console.error("Error al obtener usuarios:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

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
      .withGraphFetched(
        "especialidades.especialidadCreada(selectNombreEspecialidad)"
      )
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

async function createUser(req, res) {
  const trx = await User.startTransaction();

  try {
    const {
      user_complete_name,
      user_dni,
      user_phone,
      user_email,
      user_role,
      user_password,
      especialidad,
    } = req.body;

    if (
      !user_complete_name ||
      !user_dni ||
      !user_phone ||
      !user_email ||
      !user_role ||
      !user_password
    ) {
      await trx.rollback();
      return res.status(400).json({ error: "Todos los campos son requeridos" });
    }

    if (user_role === "profesional" && !especialidad) {
      await trx.rollback();
      return res
        .status(400)
        .json({ error: "El rol profesional requiere especialidad" });
    }

    const existingUser = await User.query(trx).findOne({ user_email });
    if (existingUser) {
      await trx.rollback();
      return res.status(409).json({ error: "El email ya está en uso" });
    }

    const company_id =
      req.user.role === "superadmin"
        ? req.body.company_id
        : req.user.company_id;

    const user = await User.query(trx).insert({
      user_complete_name,
      user_dni,
      user_phone,
      user_email,
      user_role,
      user_status: true,
      company_id,
      user_password: bcrypt.hashSync(user_password, saltRounds),
    });

    if (user_role === "profesional" && especialidad) {
      await asignarEspecialidad(trx, user.user_id, especialidad, company_id);
    }

    await trx.commit();
    return res
      .status(201)
      .json({ success: true, message: "Usuario creado correctamente" });
  } catch (error) {
    await trx.rollback();
    // console.error("Error al crear usuario con especialidad:", error);
    return res
      .status(500)
      .json({ error: error.message || "Error interno del servidor" });
  }
}

async function asignarEspecialidadManual(req, res) {
  try {
    const companyId = req.user.company_id;
    const id_usuario = Number(req.params.id_usuario);
    const { id_especialidad } = req.body;

    if (!id_especialidad || !id_usuario) {
      return res
        .status(400)
        .json({ error: "id_usuario e id_especialidad son requeridos" });
    }

    await asignarEspecialidad(id_usuario, id_especialidad, companyId);

    return res
      .status(200)
      .json({ message: "Especialidad asignada correctamente" });
  } catch (error) {
    // console.error("Error al asignar especialidad:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

async function asignarEspecialidad(
  trx,
  id_usuario,
  id_especialidad,
  company_id
) {
  const especialidadExiste = await trx("especialidades")
    .where({ id_especialidad: id_especialidad, company_id })
    .first();

  if (!especialidadExiste) {
    throw new Error("La especialidad no existe en esta empresa");
  }

  return await ProfesionaleSespecialidad.query(trx).insert({
    id_usuario,
    id_especialidad_creada: id_especialidad,
    company_id,
  });
}

async function updateUser(req, res) {
  try {
    const { user_id } = req.params;
    const {
      user_complete_name,
      user_dni,
      user_phone,
      user_email,
      user_role,
      user_status,
      company_id,
    } = req.body;

    if (
      user_complete_name == "" ||
      user_dni == "" ||
      user_phone == "" ||
      user_email == "" ||
      user_role == "" ||
      user_status == "" ||
      company_id == ""
    ) {
      return res.status(400).json({ error: "Todos los campos son requeridos" });
    }

    if (User.query().findOne({ user_email })) {
      return res.status(409).json({ error: "El email ya está en uso" });
    }

    const user = await User.query().patchAndFetchById(user_id, {
      user_complete_name,
      user_dni,
      user_phone,
      user_email,
      user_role,
      user_status,
      company_id,
    });

    return res
      .status(200)
      .json({ success: true, message: "Usuario actualizado correctamente" });
  } catch (error) {
    // console.error("Error al actualizar usuario:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

async function bloquearUsuarioPorId(user_id) {
  return await User.query().patchAndFetchById(user_id, { user_status: false });
}

async function habilitarUsuarioPorId(user_id) {
  await UserLogController.deleteLogByYserid(user_id);
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
  getAll,
  getUsersByCompany,
  createUser,
  asignarEspecialidadManual,
  updateUser,
  bloquearUsuarioPorId,
  habilitarUsuarioPorId,
  restoreUser,
};
