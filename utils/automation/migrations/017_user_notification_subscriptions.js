exports.up = function(knex) {
  return knex.schema.createTable('user_notification_subscriptions', function(table) {
    table.increments('id').primary();
    table.integer('user_id').notNullable();
    table.text('subscription').notNullable(); // JSON string
    table.enum('platform', ['web', 'android', 'ios']).defaultTo('web');
    table.boolean('is_active').defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    table.index(['user_id', 'is_active']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('user_notification_subscriptions');
};
