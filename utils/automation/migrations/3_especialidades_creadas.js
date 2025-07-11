// migracion para especialidades_creadas
exports.up = function(knex) {
  return knex.schema.createTable("especialidades_creadas", function(table) {
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
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists("especialidades_creadas");
};
