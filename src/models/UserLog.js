const BaseModel = require("../db/BaseModel");

class UserLog extends BaseModel {
  static get tableName() {
    return "user_logs";
  }

  static get idColumn() {
    return "user_log_id";
  }

  static get jsonSchema() {
    return {
      type: "object",

      properties: {
        user_log_id: { type: "integer" },
        user_id: { type: ["integer", "null"] },
        created_at: { type: "string", format: "date-time" },
      },
    };
  }

  static get relationMappings() {
    const User = require("./User");

    return {
      user: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "user_logs.user_id",
          to: "users.user_id",
        },
      },
    };
  }
}

module.exports = UserLog;
