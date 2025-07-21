exports.up = function (knex) {
  return knex.schema
    .createTable("clientes_recurrentes", function (table) {
      table.increments("cliente_id").primary();
      table.string("cliente_complete_name").notNullable();
      table.string("cliente_dni").notNullable();
      table.string("cliente_phone").notNullable();
      table.string("cliente_email").notNullable();
      table.string("cliente_direccion").nullable();
      table.decimal("cliente_lat", 10, 7).nullable();
      table.decimal("cliente_lng", 10, 7).nullable();

      table.integer("company_id").unsigned().nullable();
      table
        .foreign("company_id")
        .references("company_id")
        .inTable("companies")
        .onDelete("SET NULL")
        .onUpdate("CASCADE");
      table.timestamps(true, true);
    })
    .then(() =>
      knex.raw("ALTER TABLE clientes_recurrentes AUTO_INCREMENT = 9000")
    );
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("clientes_recurrentes");
};
