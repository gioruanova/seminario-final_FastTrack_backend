const BaseModel = require("../db/BaseModel");

class ProfesionalEspecialidad extends BaseModel {
  static get tableName() {
    return "profesionales_especialidad";
  }

  static get idColumn() {
    return "id_asignacion";
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["id_usuario", "company_id", "id_especialidad"],
      properties: {
        id_asignacion: { type: "integer" },
        id_usuario: { type: "integer" },
        company_id: { type: "integer" },
        id_especialidad: { type: "integer" },
      },
    };
  }

  static get relationMappings() {
    const User = require("./User");
    const Company = require("./Company");
    const Especialidad = require("./Especialidad");

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
      Especialidad: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: Especialidad,
        join: {
          from: "profesionales_especialidad.id_especialidad",
          to: "especialidades.id_especialidad",
        },
      },
    };
  }

  $beforeUpdate() {
    this.updated_at = new Date();
  }
}

module.exports = ProfesionalEspecialidad;
