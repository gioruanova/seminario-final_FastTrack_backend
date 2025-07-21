exports.up = function (knex) {
  return knex.schema
    .createTable("reclamos", function (table) {
      table.increments("reclamo_id").primary();
      table.string("reclamo_titulo").notNullable();
      table.text("reclamo_detalle").notNullable();
      table.text("reclamo_url").nullable();
      table
        .enu("reclamo_estado", ["ABIERTO", "EN PROCESO", "EN PAUSA", "CERRADO", "CANCELADO", "RE-ABIERTO"])
        .notNullable()
        .defaultTo("abierto");

      table
        .integer("creado_por")
        .unsigned()
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
        .integer("especialidad_id")
        .unsigned()
        .notNullable()
        .references("id_especialidad")
        .inTable("especialidades")
        .onDelete("CASCADE")
        .onUpdate("CASCADE");

      table
        .integer("profesional_id")
        .unsigned()
        .references("user_id")
        .inTable("users")
        .onDelete("CASCADE")
        .onUpdate("CASCADE");

      table
        .integer("cliente_id")
        .unsigned()
        .notNullable()
        .references("cliente_id")
        .inTable("clientes_recurrentes")
        .onDelete("CASCADE")
        .onUpdate("CASCADE");

      table.text("reclamo_nota_cierre").nullable();
      table.decimal("reclamo_presupuesto", 10, 2).nullable();

      table.timestamps(true, true);
    })
    .then(() => knex.raw("ALTER TABLE reclamos AUTO_INCREMENT = 10000"));
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("reclamos");
};
