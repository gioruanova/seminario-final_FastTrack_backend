const BaseModel = require('../db/BaseModel');

class UserNotificationSubscription extends BaseModel {
  static get tableName() {
    return 'user_notification_subscriptions';
  }

  static get idColumn() {
    return 'id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['user_id', 'subscription'],
      properties: {
        id: { type: 'integer' },
        user_id: { type: 'integer' },
        subscription: { type: 'string' },
        platform: { type: 'string', enum: ['web', 'android', 'ios'] },
        is_active: { type: 'boolean', default: true },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' }
      }
    };
  }

  static get relationMappings() {
    const User = require('./User');
    
    return {
      user: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'user_notification_subscriptions.user_id',
          to: 'users.user_id'
        }
      }
    };
  }

  $beforeUpdate() {
    this.updated_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
  }
}

module.exports = UserNotificationSubscription;
