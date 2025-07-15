exports.up = function (knex) {
  return knex.schema.createTable("platform_messages_users", function (table) {
    table.increments("id").primary();

    table
      .integer("platform_message_id")
      .unsigned()
      .notNullable()
      .references("platform_message_id")
      .inTable("platform_messages")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");

    table
      .integer("user_id")
      .unsigned()
      .notNullable()
      .references("user_id")
      .inTable("users")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");

    table.boolean("is_read").notNullable().defaultTo(false);

    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("platform_messages_users");
};
