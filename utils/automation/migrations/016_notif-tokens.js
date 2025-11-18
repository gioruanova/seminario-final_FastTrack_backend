exports.up = function (knex) {
  return knex.schema.createTable("user_push_tokens", function (table) {
    table.increments("id").primary();

    table.integer("user_id").unsigned().notNullable();
    table.string("expo_push_token").notNullable();
    table.string("platform"); 

    table.timestamps(true, true);

    table
      .foreign("user_id")
      .references("user_id")
      .inTable("users")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");

    table.unique(['user_id', 'expo_push_token']); 
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("user_push_tokens");
};
