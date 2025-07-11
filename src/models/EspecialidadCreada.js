const BaseModel = require("../db/BaseModel");

class EspecialidadCreada extends BaseModel {
  static get tableName() {
    return "especialidades_creadas";
  }

  static get idColumn() {
    return "id_especialidad";
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["company_id", "nombre_especialidad"],
      properties: {
        id_especialidad: { type: "integer" },
        company_id: { type: "integer" },
        nombre_especialidad: { type: "string", maxLength: 255 },
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
          from: "especialidades_creadas.company_id",
          to: "companies.company_id",
        },
      },
    };
  }
}

module.exports = EspecialidadCreada;
