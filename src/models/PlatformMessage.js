const BaseModel = require("../db/BaseModel");

class PlatformMessage extends BaseModel {
  static get tableName() {
    return "platform_messages";
  }

  static get idColumn() {
    return "platform_message_id";
  }

  static get relationMappings() {
    const User = require("./User");
    const Company = require("./Company");
    const PlatformMessageUser = require("./PlatformMessageUser");

    return {
      company: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: Company,
        join: {
          from: "platform_messages.company_id",
          to: "companies.company_id",
        },
      },
      targetUser: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "platform_messages.user_id",
          to: "users.user_id",
        },
      },
      messageUsers: {
        relation: BaseModel.HasManyRelation,
        modelClass: PlatformMessageUser,
        join: {
          from: "platform_messages.platform_message_id",
          to: "platform_messages_users.platform_message_id",
        },
      },
    };
  }
  $beforeUpdate() {
    this.updated_at = new Date();
  }
}

module.exports = PlatformMessage;
