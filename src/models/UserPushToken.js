const BaseModel = require("../db/BaseModel");

class UserPushToken extends BaseModel {
  static get tableName() {
    return "user_push_tokens";
  }

  static get idColumn() {
    return "id";
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["user_id", "expo_push_token"],
      properties: {
        id: { type: "integer" },
        user_id: { type: "integer" },
        expo_push_token: { type: "string", maxLength: 255 },
        platform: { type: ["string", "null"], maxLength: 50 },
        created_at: { type: "string", format: "date-time" },
        updated_at: { type: "string", format: "date-time" },
      },
    };
  }

  $beforeUpdate() {
    this.updated_at = new Date().toISOString().slice(0, 19).replace("T", " ");
  }

  static get relationMappings() {
    const User = require("./User");

    return {
      user: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "user_push_tokens.user_id",
          to: "users.user_id",
        },
      },
    };
  }
}

module.exports = UserPushToken;

