const BaseModel = require("../db/BaseModel");

class PlatformMessageUser extends BaseModel {
  static get tableName() {
    return "platform_messages_users";
  }

  static get idColumn() {
    return "id";
  }

  static get relationMappings() {
    const User = require("./User");
    const PlatformMessage = require("./PlatformMessage");

    return {
      user: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "platform_messages_users.user_id",
          to: "users.user_id",
        },
      },
      platformMessage: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: PlatformMessage,
        join: {
          from: "platform_messages_users.platform_message_id",
          to: "platform_messages.platform_message_id",
        },
      },
    };
  }
}

module.exports = PlatformMessageUser;
