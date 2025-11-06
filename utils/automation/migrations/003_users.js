exports.up = function (knex) {
  return knex.schema
    .createTable("users", function (table) {
      table.increments("user_id").primary();
      table.string("user_complete_name").notNullable();
      table.string("user_dni").notNullable();
      table.string("user_phone").notNullable();
      table.string("user_email").notNullable().unique();
      table.text("user_password").notNullable();
      table.enum("user_role", ["superadmin", "owner", "operador", "profesional"]).notNullable();
      table.boolean("user_status").notNullable().defaultTo(true);
      table.boolean("apto_recibir").notNullable().defaultTo(true);

      table.integer("company_id").unsigned().nullable();
      table
        .foreign("company_id")
        .references("company_id")
        .inTable("companies")
        .onDelete("SET NULL")
        .onUpdate("CASCADE");
      table.timestamps(true, true);
    })
    .then(() => knex.raw("ALTER TABLE users AUTO_INCREMENT = 1000"));
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("users");
};
