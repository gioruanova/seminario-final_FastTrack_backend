const BaseModel = require("../db/BaseModel");

class CompaniesConfig extends BaseModel {
  static get tableName() {
    return "companies_config";
  }

  static get idColumn() {
    return "company_config_id";
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["company_id", "requiere_domicilio", "requiere_url"],

      properties: {
        company_config_id: { type: "integer" },
        company_id: { type: "integer" },
        requiere_domicilio: { type: "boolean", default: true },
        requiere_url: { type: "boolean", default: false },

        sing_heading_owner: { type: "string", default: "Owner" },
        plu_heading_owner: { type: "string", default: "Owners" },

        sing_heading_profesional: { type: "string", default: "Profesional" },
        plu_heading_profesional: { type: "string", default: "Profesionales" },

        sing_heading_operador: { type: "string", default: "Operador" },
        plu_heading_operador: { type: "string", default: "Operadores" },

        sing_heading_solicitante: { type: "string", default: "Solicitante" },
        plu_heading_solicitante: { type: "string", default: "Solicitantes" },

        sing_heading_reclamos: { type: "string", default: "Reclamo" },
        plu_heading_reclamos: { type: "string", default: "Reclamos" },

        string_inicio_reclamo_solicitante: {
          type: "string",
          default:
            "Hemos generado un gestion en base a su pedido. Adjunta encontrara la informacion pertinetne al mismo:",
        },
        string_recordatorio_reclamo_solicitante: {
          type: "string",
          default:
            "La fecha de gestion de su pedido se acerca. Adjunta encontrara la informacion pertinetne al mismo:",
        },
        string_cierre_reclamo_solicitante: {
          type: "string",
          default:
            "Su gestion ha finalizado. Adjunta encontrara la informacion pertinetne al mismo:",
        },

        string_inicio_reclamo_profesional: {
          type: "string",
          default:
            "Se ha generado una nueva asignacion para su actividad. Adjunta encontrara la informacion pertinetne al mismo:",
        },
        string_recordatorio_reclamo_profesional: {
          type: "string",
          default:
            "La fecha de gestion de su actividad se acerca. Adjunta encontrara la informacion pertinetne al mismo:",
        },
        string_cierre_reclamo_profesional: {
          type: "string",
          default:
            "Se ha finalizado la gestion asignada. Adjunta encontrara la informacion pertinetne al mismo:",
        },
      },
    };
  }

  static get relationMappings() {
    const Company = require("./Company");
    return {
      company: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: Company,
        join: {
          from: "companies_config.company_id",
          to: "companies.company_id",
        },
      },
    };
  }
}

module.exports = CompaniesConfig;
