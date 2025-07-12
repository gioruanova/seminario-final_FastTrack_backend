// migracion para profesionales_especialidad
exports.up = function(knex) {
  return knex.schema.createTable("profesionales_especialidad", function(table) {
    table.increments("id_especialidad").primary();

    table
      .integer("id_usuario")
      .unsigned()
      .notNullable()
      .references("user_id")
      .inTable("users")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");

    table
      .integer("company_id")
      .unsigned()
      .notNullable()
      .references("company_id")
      .inTable("companies")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");

    table
      .integer("id_especialidad_creada")
      .unsigned()
      .notNullable()
      .references("id_especialidad")
      .inTable("especialidades")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists("profesionales_especialidad");
};
