const { Model } = require("objection");

class LogGlobal extends Model {
  static get tableName() {
    return "log_global";
  }

  static get idColumn() {
    return "log_id";
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["log_detalle", "log_leido"],

      properties: {
        log_id: { type: "integer" },
        log_company_id: { type: ["integer", "null"] },
        log_detalle: { type: "string" },
        log_leido: { type: "boolean", default: false },
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

    return {
      company: {
        relation: Model.BelongsToOneRelation,
        modelClass: Company,
        join: {
          from: "log_global.log_company_id",
          to: "companies.company_id",
        },
      },
    };
  }
}

module.exports = LogGlobal;
