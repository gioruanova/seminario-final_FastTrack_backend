const BaseModel = require("../db/BaseModel");

class Especialidad extends BaseModel {
  static get tableName() {
    return "especialidades";
  }

  static get idColumn() {
    return "id_especialidad";
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["company_id", "nombre_especialidad", "estado_especialidad"],
      properties: {
        id_especialidad: { type: "integer" },
        company_id: { type: "integer" },
        nombre_especialidad: { type: "string", maxLength: 255 },
        estado_especialidad: { type: "boolean", default: true },
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
          from: "especialidades.company_id",
          to: "companies.company_id",
        },
      },
    };
  }
}

module.exports = Especialidad;
