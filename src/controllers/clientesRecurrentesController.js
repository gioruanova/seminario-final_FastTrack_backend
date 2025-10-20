const ClienteRecurrente = require("../models/ClienteRecurrente");
const Company = require("../models/Company");
const companyConfigController = require("./companyConfigController");

// CONTROLADORES PARA ADMIN:
// ---------------------------------------------------------
// Obtener clientes recurrentes
// ---------------------------------------------------------
async function getAllClientesRecurrentesAsAdmin(req, res) {
  try {
    const clientesRecurrentes = await ClienteRecurrente.query();
    return res.json(clientesRecurrentes);
  } catch (error) {
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

// CONTROLADORES PARA CLIENTE:
// ---------------------------------------------------------
// Obtener clientes recurrentes
// ---------------------------------------------------------
async function getAllClientesRecurrentesAsClient(req, res) {
  const company_id = req.user.company_id;
  try {
    const clientesRecurrentes = await ClienteRecurrente.query().where({
      company_id,
    });
    return res.json(clientesRecurrentes);
  } catch (error) {
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

// ---------------------------------------------------------
// Crear cliente recurrente
// ---------------------------------------------------------

async function createClienteRecurrenteAsClient(req, res) {
  const company_id = req.user.company_id;
  const {
    cliente_complete_name,
    cliente_dni,
    cliente_phone,
    cliente_email,
    cliente_direccion,
    cliente_lat,
    cliente_lng,
  } = req.body;

  try {
    const company = await Company.query().findById(company_id);
    if (!company) {
      return res.status(400).json({ error: "No existe empresa bajo ese ID" });
    }

    const requiereDomicilio =
      await companyConfigController.fetchCompanySettingsByCompanyId(company_id);

    if (requiereDomicilio.requiere_domicilio && !cliente_direccion) {
      return res
        .status(400)
        .json({ error: "El campo domicilio es obligatorio." });
    }
    if (
      !cliente_complete_name ||
      !cliente_dni ||
      !cliente_phone ||
      !cliente_email ||
      (requiereDomicilio.requiere_domicilio && !cliente_direccion) ||
      (requiereDomicilio.requiere_domicilio && !cliente_lat) ||
      (requiereDomicilio.requiere_domicilio && !cliente_lng)
    ) {
      return res.status(400).json({
        status: 400,
        error:
          "Los campos cliente_complete_name, cliente_dni, cliente_phone, cliente_email, cliente_direccion, cliente_lat y cliente_lng son obligatorios.",
      });
    }

    const clienteExiste = await ClienteRecurrente.query()
      .where("company_id", company_id)
      .andWhere((builder) => {
        builder
          .where("cliente_dni", cliente_dni)
          .orWhere("cliente_email", cliente_email);
      })
      .first();

    if (clienteExiste) {
      return res
        .status(400)
        .json({ error: "Ya existe un cliente recurrente con ese DNI o email" });
    }

    const clienteRecurrente = await ClienteRecurrente.query().insertAndFetch({
      company_id,
      cliente_complete_name,
      cliente_dni,
      cliente_phone,
      cliente_email,
      cliente_direccion,
      cliente_lat,
      cliente_lng,
    });

    return res.status(200).json({
      success: true,
      message: "Cliente recurrente creado correctamente",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

//  ---------------------------------------------------------
// Actualizar cliente recurrente
// ---------------------------------------------------------
async function editarClienteAsClient(req, res) {
  const company_id = req.user.company_id;
  const { cliente_id } = req.params;

  // Lista de campos que se pueden editar
  const camposEditables = [
    "cliente_complete_name",
    "cliente_dni",
    "cliente_phone",
    "cliente_email",
    "cliente_direccion",
    "cliente_lat",
    "cliente_lng",
  ];

  try {
    // Buscar si el cliente existe y pertenece a la empresa
    const cliente = await ClienteRecurrente.query()
      .where({ cliente_id, company_id })
      .first();

    if (!cliente) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    // Construyo objeto con solo los campos válidos y no vacíos
    const datosActualizables = {};
    for (const campo of camposEditables) {
      if (req.body.hasOwnProperty(campo)) {
        const valor = req.body[campo];

        // Valido que no sea null, undefined ni string vacío
        if (valor === null || valor === undefined || valor === "") {
          return res.status(400).json({
            error: `El campo '${campo}' no puede estar vacío si se envía.`,
          });
        }

        datosActualizables[campo] = valor;
      }
    }

    // Si no se envió ningún campo válido, corto
    if (Object.keys(datosActualizables).length === 0) {
      return res
        .status(400)
        .json({ error: "No se enviaron campos para actualizar." });
    }

    await ClienteRecurrente.query()
      .patch(datosActualizables)
      .where({ cliente_id, company_id });

    return res.status(200).json({
      success: true,
      message: "Cliente actualizado correctamente",
    });
  } catch (error) {
    console.error("editarCliente error:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

// ---------------------------------------------------------
// Desactivar cliente recurrente
// ---------------------------------------------------------
async function desactivarClienteAsClient(req, res) {
  const company_id = req.user.company_id;
  const { cliente_id } = req.params;

  try {
    const cliente = await ClienteRecurrente.query()
      .where({ cliente_id, company_id })
      .first();

    if (!cliente) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    await ClienteRecurrente.query()
      .patch({ cliente_active: false })
      .where({ cliente_id, company_id });

    return res.status(200).json({
      success: true,
      message: "Cliente desactivado correctamente",
    });
  } catch (error) {
    console.error("desactivarCliente error:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

// ---------------------------------------------------------
// Activar cliente recurrente
// ---------------------------------------------------------

async function activarClienteAsClient(req, res) {
  const company_id = req.user.company_id;
  const { cliente_id } = req.params;

  try {
    const cliente = await ClienteRecurrente.query()
      .where({ cliente_id, company_id })
      .first();

    if (!cliente) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    await ClienteRecurrente.query()
      .patch({ cliente_active: true })
      .where({ cliente_id, company_id });

    return res.status(200).json({
      success: true,
      message: "Cliente activado correctamente",
    });
  } catch (error) {
    console.error("activarCliente error:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

module.exports = {
  getAllClientesRecurrentesAsAdmin,

  getAllClientesRecurrentesAsClient,
  createClienteRecurrenteAsClient,
  editarClienteAsClient,
  activarClienteAsClient,
  desactivarClienteAsClient,
};
