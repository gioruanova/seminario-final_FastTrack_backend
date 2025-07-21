const BaseModel = require("../db/BaseModel");

class AgendaBloqueada extends BaseModel {
  static get tableName() {
    return "agenda_bloqueada";
  }

  static get idColumn() {
    return "agenda_id";
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: [
        "agenda_fecha",
        "agenda_hora_desde",
        "company_id",
        "profesional_id",
      ],

      properties: {
        agenda_id: { type: "integer" },
        agenda_fecha: { type: "string", format: "date" },
        agenda_hora_desde: {
          type: "string",
          pattern: "^(\\d|[01]\\d|2[0-3]):[0-5]\\d(:[0-5]\\d)?$",
        },
        agenda_hora_hasta: {
          type: "string",
          pattern: "^(\\d|[01]\\d|2[0-3]):[0-5]\\d(:[0-5]\\d)?$",
        },
        company_id: { type: "integer" },
        profesional_id: { type: "integer" },
        agenda_notas: {
          type: ["string", "null"],
          default: "Bloqueo de agenda",
        },
        created_at: { type: "string", format: "date-time" },
        updated_at: { type: "string", format: "date-time" },
      },
    };
  }

  $beforeUpdate() {
    this.updated_at = new Date().toISOString().slice(0, 19).replace("T", " ");
  }

  static get relationMappings() {
    const Company = require("./Company");
    const User = require("./User");

    return {
      company: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: Company,
        join: {
          from: "agenda_bloqueada.company_id",
          to: "companies.company_id",
        },
      },
      profesional: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "agenda_bloqueada.profesional_id",
          to: "users.user_id",
        },
      },
    };
  }
}

module.exports = AgendaBloqueada;
