exports.up = function (knex) {
  return knex.schema.createTable("log_global", function (table) {
    table.increments("log_id").primary();
    table
      .integer("log_company_id")
      .unsigned()
      .nullable()
      .references("company_id")
      .inTable("companies")
      .onDelete("SET NULL");

    table.string("log_detalle").notNullable();
    table.boolean("log_leido").notNullable().defaultTo(false);

    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("log_global");
};
