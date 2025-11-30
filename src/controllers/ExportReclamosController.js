const { exportToExcel } = require("../helpers/exportHelpers");
const ReclamoService = require("../services/reclamos/ReclamoService");
const ConfigService = require("../services/companyConfig/ConfigService");

async function exportReclamosToExcel(req, res) {
  try {
    const companyId = req.user.company_id;
    const statusParam = req.params.status?.toLowerCase();
    const configCompany = await ConfigService.getCompanyConfig(companyId);
    const data = await ReclamoService.fetchReclamosByCompanyId(companyId);

    let filtered;
    let statusReport;

    if (statusParam === "all") {
      filtered = data;
      statusReport = "Historico";

    } else if (statusParam === "active") {
      const activeStates = ["ABIERTO", "EN PROCESO", "EN PAUSA", "RE-ABIERTO"];
      statusReport = "En curso";

      filtered = data.filter((r) => activeStates.includes(r.reclamo_estado));
    } else if (statusParam === "inactive") {
      const inactiveStates = ["CERRADO", "CANCELADO"];
      statusReport = "Fuera de curso";
      filtered = data.filter((r) => inactiveStates.includes(r.reclamo_estado));

    } else {
      return res.status(400).json({ error: "Parámetro de estado inválido" });
    }

    if (!filtered.length) {
      return res.status(404).json({ error: "No hay reclamos para exportar" });
    }

    const columns = [
      {
        header: `Código ${configCompany.sing_heading_reclamos}`,
        key: "reclamo_id",
        width: 15,
      },
      {
        header: `Iniciado por`,
        key: "creador", width: 10
      },
      {
        header: `Fecha inicio`,
        key: "created_at", width: 15
      },
      {
        header: `Título ${configCompany.sing_heading_reclamos}`,
        key: "reclamo_titulo",
        width: 30,
      },
      {
        header: `Detalle ${configCompany.sing_heading_reclamos}`,
        key: "reclamo_detalle",
        width: 30,
      },
      {
        header: `${configCompany.sing_heading_especialidad}`,
        key: "nombre_especialidad",
        width: 15,
      },
      {
        header: `${configCompany.sing_heading_profesional} asignado`,
        key: "profesional",
        width: 15,
      },
      {
        header: `Fecha Pactada`,
        key: "agenda_fecha", width: 15
      },
      {
        header: `Hora Pactada`,
        key: "agenda_hora_desde", width: 15
      },
      {
        header: `${configCompany.sing_heading_solicitante} Nombre`,
        key: "cliente_complete_name",
        width: 30,
      },
      {
        header: `${configCompany.sing_heading_solicitante} Email`,
        key: "cliente_email",
        width: 30,
      },
      {
        header: `${configCompany.sing_heading_solicitante} Telefono`,
        key: "cliente_phone",
        width: 30,
      },
      { header: `Estado`, key: "reclamo_estado", width: 15 },
      {
        header: `Nota ${configCompany.sing_heading_profesional} `,
        key: "reclamo_nota_cierre",
        width: 30,
      },
      {
        header: `Presupuesto ${configCompany.sing_heading_profesional} `,
        key: "reclamo_presupuesto",
        width: 30,
      },
      { header: `Ultima actualización`, key: "updated_at", width: 30 },
    ];

    const fileName = `${configCompany.company.company_nombre} - Reporte ${configCompany.plu_heading_reclamos} - [${statusReport}]`;
    const sheetName = `Reporte de ${configCompany.plu_heading_reclamos}`;

    await exportToExcel(res, fileName, sheetName, columns, filtered, configCompany.company, req.user);
  } catch (error) {
    console.error("Error en ExportReclamosController:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

module.exports = { exportReclamosToExcel };

