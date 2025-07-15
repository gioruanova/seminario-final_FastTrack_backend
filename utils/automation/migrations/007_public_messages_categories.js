exports.up = function (knex) {
  return knex.schema.createTable(
    "public_messages_categories",
    function (table) {
      table.increments("category_id").primary();
      table.string("category_name").notNullable();
      table.boolean("category_status").notNullable().defaultTo(true);

      table.timestamps(true, true);
    }
  );
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("public_messages_categories");
};
