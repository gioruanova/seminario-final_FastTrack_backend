const BaseModel = require("../db/BaseModel");
const ProfesionalEspecialidad = require("./ProfesionalesEspecialidad");

class User extends BaseModel {
  static get tableName() {
    return "users";
  }

  static get idColumn() {
    return "user_id";
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: [
        "user_complete_name",
        "user_dni",
        "user_phone",
        "user_email",
        "user_password",
        "user_role",
      ],
      properties: {
        user_id: { type: "integer" },
        user_complete_name: { type: "string", maxLength: 255 },
        user_dni: { type: "string", maxLength: 100 },
        user_phone: { type: "string", maxLength: 50 },
        user_email: { type: "string", maxLength: 255, format: "email" },
        user_password: { type: "string" },
        user_role: { type: "string", maxLength: 50 },
        user_status: { type: "boolean", default: true },
        company_id: { type: ["integer", "null"] },
        created_at: { type: "string", format: "date-time" },
        updated_at: { type: "string", format: "date-time" },
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
          from: "users.company_id",
          to: "companies.company_id",
        },
      },
      especialidades: {
        relation: BaseModel.HasManyRelation,
        modelClass: ProfesionalEspecialidad,
        join: {
          from: "users.user_id",
          to: "profesionales_especialidad.id_usuario",
        },
      },

      platformMessageUsers: {
        relation: BaseModel.HasManyRelation,
        modelClass: PlatformMessageUser,
        join: {
          from: "users.user_id",
          to: "platform_messages_users.user_id",
        },
      },
    };
  }
}

module.exports = User;
