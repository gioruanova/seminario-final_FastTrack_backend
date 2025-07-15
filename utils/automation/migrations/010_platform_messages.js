exports.up = function (knex) {
  return knex.schema.createTable("platform_messages", function (table) {
    table.increments("platform_message_id").primary();
    table.string("message_sender", 100).notNullable();

    table.string("platform_message_title").notNullable();
    table.text("platform_message_content", "longtext").notNullable();

    table
      .integer("company_id")
      .unsigned()
      .nullable()
      .references("company_id")
      .inTable("companies")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");

    table
      .integer("user_id")
      .unsigned()
      .nullable()
      .references("user_id")
      .inTable("users")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");

    table.boolean("apto_empresa").notNullable().defaultTo(false);
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("platform_messages");
};
