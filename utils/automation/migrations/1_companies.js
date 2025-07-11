exports.up = function (knex) {
  return knex.schema
    .createTable("companies", function (table) {
      table.increments("company_id").primary();
      table.string("company_unique_id").notNullable().unique();
      table.string("company_nombre").notNullable();
      table.string("company_phone").notNullable();
      table.string("company_email").unique().notNullable();
      table.string("company_whatsapp");
      table.string("company_telegram");
      table.boolean("company_estado").notNullable().defaultTo(true);
      table.integer("limite_operadores").notNullable().defaultTo(3);
      table.integer("limite_profesionales").notNullable().defaultTo(10);
      table.boolean("reminder_manual").notNullable().defaultTo(true);
      table.timestamps(true, true);
    })
    .then(() => knex.raw("ALTER TABLE companies AUTO_INCREMENT = 1000"));
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("companies");
};
