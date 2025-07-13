// migracion para especialidades
exports.up = function(knex) {
  return knex.schema.createTable("especialidades", function(table) {
    table.increments("id_especialidad").primary();
    table
      .integer("company_id")
      .unsigned()
      .notNullable()
      .references("company_id")
      .inTable("companies")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");
    table.string("nombre_especialidad").notNullable();
    table.boolean("estado_especialidad").notNullable().defaultTo(true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists("especialidades");
};
