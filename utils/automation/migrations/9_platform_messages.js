exports.up = function (knex) {
  return knex.schema.createTable("platform_messages", function (table) {
    table.increments("platform_message_id").primary();
    table.string("platform_message_title").notNullable();
    table.text("platform_message_content", "longtext").notNullable();

    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("platform_messages");
};
