// -----------------
// CONTROLADOR DE CLIENTES RECURRENTES
// -----------------

const companyConfigController = require("./companyConfigController");
const Company = require("../models/Company");
const ClienteRecurrente = require("../models/ClienteRecurrente");
const { enviarLista, enviarExito, enviarError, enviarNoEncontrado, enviarSolicitudInvalida, enviarConflicto } = require("../helpers/responseHelpers");
const { obtenerPorId } = require("../helpers/registroHelpers");

// -----------------
// CONTROLADORES PARA ADMIN:
// -----------------

// -----------------
// OBTENER TODOS LOS CLIENTES RECURRENTES
// -----------------
async function getAllClientesRecurrentesAsAdmin(req, res) {
  try {
    const clientesRecurrentes = await ClienteRecurrente.query();
    return enviarLista(res, clientesRecurrentes);
  } catch (error) {
    return enviarError(res, "Error interno del servidor", 500);
  }
}

// -----------------
// CONTROLADORES PARA USUARIO COMUN (CON SUS ROLES)E:
// -----------------

// -----------------
// OBTENER CLIENTES RECURRENTES DE LA EMPRESA
// -----------------
async function getAllClientesRecurrentesAsClient(req, res) {
  const company_id = req.user.company_id;
  try {
    const clientesRecurrentes = await ClienteRecurrente.query().where({
      company_id,
    });
    return enviarLista(res, clientesRecurrentes);
  } catch (error) {
    return enviarError(res, "Error interno del servidor", 500);
  }
}

// -----------------
// CREAR CLIENTE RECURRENTE
// -----------------
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
    const company = await obtenerPorId(Company, company_id);
    if (!company) {
      return enviarSolicitudInvalida(res, "No existe empresa bajo ese ID");
    }

    const requiereDomicilio =
      await companyConfigController.fetchCompanySettingsByCompanyId(company_id);

    if (requiereDomicilio.requiere_domicilio && !cliente_direccion) {
      return enviarSolicitudInvalida(res, "El campo domicilio es obligatorio.");
    }
    if (
      !cliente_complete_name ||
      !cliente_dni ||
      !cliente_phone ||
      !cliente_email ||
      (requiereDomicilio.requiere_domicilio && !cliente_direccion)
    ) {
      return enviarSolicitudInvalida(res, "Los campos cliente_complete_name, cliente_dni, cliente_phone, cliente_email y cliente_direccion (si requiere domicilio) son obligatorios.");
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
      return enviarConflicto(res, "Ya existe un cliente recurrente con ese DNI o email");
    }

    await ClienteRecurrente.query().insertAndFetch({
      company_id,
      cliente_complete_name,
      cliente_dni,
      cliente_phone,
      cliente_email,
      cliente_direccion,
      cliente_lat,
      cliente_lng,
    });

    return enviarExito(res, "Cliente recurrente creado correctamente");
  } catch (error) {
    console.error(error);
    return enviarError(res, "Error interno del servidor", 500);
  }
}

// -----------------
// ACTUALIZAR CLIENTE RECURRENTE
// -----------------
async function editarClienteAsClient(req, res) {
  const company_id = req.user.company_id;
  const { cliente_id } = req.params;

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
      return enviarNoEncontrado(res, "Cliente");
    }

    const datosActualizables = {};
    const camposOpcionales = ["cliente_lat", "cliente_lng"];
    
    if (!req.body || typeof req.body !== 'object') {
      return enviarSolicitudInvalida(res, "El cuerpo de la solicitud debe ser un objeto válido.");
    }
    
    for (const campo of camposEditables) {
      if (req.body[campo] !== undefined) {
        const valor = req.body[campo];
        const esOpcional = camposOpcionales.includes(campo);

        if (esOpcional) {
          if (valor === "" || (typeof valor === "string" && valor.trim() === "")) {
            return enviarSolicitudInvalida(res, `El campo '${campo}' no puede ser un string vacío. Use null para eliminarlo.`);
          }
          datosActualizables[campo] = (valor === null || valor === undefined) ? null : valor;
        } else {
          if (valor === null || valor === undefined || valor === "") {
            return enviarSolicitudInvalida(res, `El campo '${campo}' no puede estar vacío si se envía.`);
          }
          datosActualizables[campo] = valor;
        }
      }
    }

    if (Object.keys(datosActualizables).length === 0) {
      return enviarSolicitudInvalida(res, "No se enviaron campos para actualizar.");
    }

    await ClienteRecurrente.query()
      .patch(datosActualizables)
      .where({ cliente_id, company_id });

    return enviarExito(res, "Cliente actualizado correctamente");
  } catch (error) {
    console.error("editarCliente error:", error);
    return enviarError(res, "Error interno del servidor", 500);
  }
}

// -----------------
// DESACTIVAR CLIENTE RECURRENTE
// -----------------
async function desactivarClienteAsClient(req, res) {
  const company_id = req.user.company_id;
  const { cliente_id } = req.params;

  try {
    const cliente = await ClienteRecurrente.query()
      .where({ cliente_id, company_id })
      .first();

    if (!cliente) {
      return enviarNoEncontrado(res, "Cliente");
    }

    await ClienteRecurrente.query()
      .patch({ cliente_active: false })
      .where({ cliente_id, company_id });

    return enviarExito(res, "Cliente desactivado correctamente");
  } catch (error) {
    console.error("desactivarCliente error:", error);
    return enviarError(res, "Error interno del servidor", 500);
  }
}

// -----------------
// ACTIVAR CLIENTE RECURRENTE
// -----------------
async function activarClienteAsClient(req, res) {
  const company_id = req.user.company_id;
  const { cliente_id } = req.params;

  try {
    const cliente = await ClienteRecurrente.query()
      .where({ cliente_id, company_id })
      .first();

    if (!cliente) {
      return enviarNoEncontrado(res, "Cliente");
    }

    await ClienteRecurrente.query()
      .patch({ cliente_active: true })
      .where({ cliente_id, company_id });

    return enviarExito(res, "Cliente activado correctamente");
  } catch (error) {
    console.error("activarCliente error:", error);
    return enviarError(res, "Error interno del servidor", 500);
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
