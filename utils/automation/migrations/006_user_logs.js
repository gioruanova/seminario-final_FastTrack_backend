exports.up = function (knex) {
  return knex.schema.createTable("user_logs", function (table) {
    table.increments("user_log_id").primary();
    table.integer("user_id").unsigned().nullable();

    table
      .foreign("user_id")
      .references("user_id")
      .inTable("users")
      .onDelete("SET NULL")
      .onUpdate("CASCADE");

    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("user_logs");
};
