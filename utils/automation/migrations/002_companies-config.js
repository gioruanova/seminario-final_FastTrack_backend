exports.up = function (knex) {
  return knex.schema.createTable("companies_config", function (table) {
    table.increments("company_config_id").primary();

    table
      .integer("company_id")
      .unsigned()
      .notNullable()
      .references("company_id")
      .inTable("companies")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");

    // Configuración general
    table.boolean("requiere_domicilio").notNullable().defaultTo(true);
    table.boolean("requiere_url").notNullable().defaultTo(false);
    table.boolean("requiere_fecha_final").notNullable().defaultTo(false);

    // Headings: singular y plural
    table.string("sing_heading_owner").notNullable().defaultTo("Owner");
    table.string("plu_heading_owner").notNullable().defaultTo("Owners");

    table.string("sing_heading_profesional").notNullable().defaultTo("Profesional");
    table.string("plu_heading_profesional").notNullable().defaultTo("Profesionales");

    table.string("sing_heading_operador").notNullable().defaultTo("Operador");
    table.string("plu_heading_operador").notNullable().defaultTo("Operadores");

    table.string("sing_heading_solicitante").notNullable().defaultTo("Solicitante");
    table.string("plu_heading_solicitante").notNullable().defaultTo("Solicitantes");

    table.string("sing_heading_reclamos").notNullable().defaultTo("Reclamo");
    table.string("plu_heading_reclamos").notNullable().defaultTo("Reclamos");

    table.string("sing_heading_especialidad").notNullable().defaultTo("Especialidad");
    table.string("plu_heading_especialidad").notNullable().defaultTo("Especialidades");

    // Strings personalizados para reclamos
    table.text("string_inicio_reclamo_solicitante").notNullable().defaultTo("Hemos generado una gestión en base a su pedido. Adjunta encontrará la información pertinente al mismo:");
    table.text("string_recordatorio_reclamo_solicitante").notNullable().defaultTo("La fecha de gestión de su pedido se acerca. Adjunta encontrará la información pertinente al mismo:");
    table.text("string_actualizacion_reclamo_solicitante").notNullable().defaultTo("Hay una nueva actualizacion en una gestion registrada. Adjunta encontrará la información pertinente al mismo:");
    table.text("string_cierre_reclamo_solicitante").notNullable().defaultTo("Su gestión ha finalizado. Adjunta encontrará la información pertinente al mismo:");

    table.text("string_inicio_reclamo_profesional").notNullable().defaultTo("Se ha generado una nueva asignación para su actividad. Adjunta encontrará la información pertinente al mismo:");
    table.text("string_recordatorio_reclamo_profesional").notNullable().defaultTo("La fecha de gestión de su actividad se acerca. Adjunta encontrará la información pertinente al mismo:");
    table.text("string_actualizacion_reclamo_profesional").notNullable().defaultTo("Hay una nueva actualizacion en una gestion registrada  a su nombre. Adjunta encontrará la información pertinente al mismo:");
    table.text("string_cierre_reclamo_profesional").notNullable().defaultTo("Se ha finalizado la gestión asignada. Adjunta encontrará la información pertinente al mismo:");

    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("companies_config");
};
