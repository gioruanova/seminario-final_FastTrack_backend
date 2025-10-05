const ClienteRecurrente = require("../models/ClienteRecurrente");
const Company = require("../models/Company");
const companyConfigController = require("./companyConfigController");

// CONTROLADORES PARA CLIENTE:
// ---------------------------------------------------------
// Obtener clientes recurrentes
// ---------------------------------------------------------
async function getAllClientesRecurrentesAsClient(req, res) {
  console.log('aca');
  
  
  const company_id = req.user.company_id;
  console.log(req);
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

module.exports = {
  getAllClientesRecurrentesAsClient,
  createClienteRecurrenteAsClient,
};
