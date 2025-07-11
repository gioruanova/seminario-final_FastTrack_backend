const BaseModel = require("../db/BaseModel");

class ProfesionalEspecialidad extends BaseModel {
  static get tableName() {
    return "profesionales_especialidad";
  }

  static get idColumn() {
    return "id_especialidad"; 
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["id_usuario", "company_id", "id_especialidad_creada"],
      properties: {
        id_especialidad: { type: "integer" },
        id_usuario: { type: "integer" },
        company_id: { type: "integer" },
        id_especialidad_creada: { type: "integer" },
      },
    };
  }

  static get relationMappings() {
    const User = require("./Users");
    const Company = require("./Company");
    const EspecialidadCreada = require("./EspecialidadCreada");

    return {
      usuario: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "profesionales_especialidad.id_usuario",
          to: "users.user_id",
        },
      },
      company: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: Company,
        join: {
          from: "profesionales_especialidad.company_id",
          to: "companies.company_id",
        },
      },
      especialidadCreada: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: EspecialidadCreada,
        join: {
          from: "profesionales_especialidad.id_especialidad_creada",
          to: "especialidades_creadas.id_especialidad",
        },
      },
    };
  }
}

module.exports = ProfesionalEspecialidad;
