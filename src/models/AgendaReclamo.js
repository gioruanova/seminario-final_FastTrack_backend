const BaseModel = require("../db/BaseModel");

class AgendaReclamo extends BaseModel {
  static get tableName() {
    return "agenda_reclamo";
  }

  static get idColumn() {
    return "agenda_reclamo_id";
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: [
        "reclamo_id",
        "agenda_fecha",
        "agenda_hora_desde",
        "agenda_hora_hasta",
      ],

      properties: {
        agenda_reclamo_id: { type: "integer" },
        reclamo_id: { type: "integer" },
        agenda_fecha: { type: "string", format: "date" },
        agenda_hora_desde: {
          type: "string",
          pattern: "^(\\d|[01]\\d|2[0-3]):[0-5]\\d(:[0-5]\\d)?$",
        },
        agenda_hora_hasta: {
          type: "string",
          pattern: "^(\\d|[01]\\d|2[0-3]):[0-5]\\d(:[0-5]\\d)?$",
        },
        agenda_notas: {
          type: ["string", "null"],
          default: "Agenda de reclamo",
        },
        company_id: { type: "integer" },
        profesional_id: { type: "integer" },
      },
    };
  }

  $beforeUpdate() {
    this.updated_at = new Date().toISOString().slice(0, 19).replace("T", " ");
  }

  async $beforeInsert(queryContext) {
    await super.$beforeInsert(queryContext);
    if (this.agenda_notas === undefined || this.agenda_notas === null) {
      this.agenda_notas = "Agenda de reclamo";
    }
  }

  static get relationMappings() {
    const Reclamo = require("./Reclamo");
    const User = require("./User");
    const Company = require("./Company");

    return {
      reclamo: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: Reclamo,
        join: {
          from: "agenda_reclamo.reclamo_id",
          to: "reclamos.reclamo_id",
        },
      },

      profesional: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "agenda_reclamo.profesional_id",
          to: "users.user_id",
        },
      },

      company: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: Company,
        join: {
          from: "agenda_reclamo.company_id",
          to: "companies.company_id",
        },
      },
    };
  }
}

module.exports = AgendaReclamo;
