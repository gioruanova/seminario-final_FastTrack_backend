const BaseModel = require("../db/BaseModel");

class Company extends BaseModel {
  static get tableName() {
    return "companies";
  }

  static get idColumn() {
    return "company_id";
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: [
        "company_unique_id",
        "company_nombre",
        "company_phone",
        "company_email",
        "limite_operadores",
        "limite_profesionales",
        "reminder_manual",
      ],
      properties: {
        company_id: { type: "integer" },
        company_unique_id: { type: "string", maxLength: 255 },
        company_nombre: { type: "string", maxLength: 255 },
        company_phone: { type: "string", maxLength: 50 },
        company_email: { type: "string", maxLength: 255, format: "email" },
        company_whatsapp: { type: ["string", "null"], maxLength: 50 },
        company_telegram: { type: ["string", "null"], maxLength: 50 },
        company_estado: { type: "boolean", default: true },
        limite_operadores: { type: "integer", minimum: 0 },
        limite_profesionales: { type: "integer", minimum: 0 },
        reminder_manual: { type: "boolean", default: true },
        created_at: { type: "string", format: "date-time" },
        updated_at: { type: "string", format: "date-time" },
      },
    };
  }
  static get relationMappings() {
    const User = require("./Users");
    const ProfesionalesEspecialidad = require("./ProfesionalesEspecialidad");

    return {
      users: {
        relation: BaseModel.HasManyRelation,
        modelClass: User,
        join: {
          from: "companies.company_id",
          to: "users.company_id",
        },
      },
      especialidades: {
        relation: BaseModel.HasManyRelation,
        modelClass: ProfesionalesEspecialidad,
        join: {
          from: "companies.company_id",
          to: "profesionales_especialidad.company_id",
        },
      },
    };
  }
}

module.exports = Company;
