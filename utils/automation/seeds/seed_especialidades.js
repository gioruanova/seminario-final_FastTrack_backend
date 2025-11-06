exports.seed = async function (knex) {
  await knex("especialidades").del();
  await knex.raw("ALTER TABLE especialidades AUTO_INCREMENT = 1");

  await knex("especialidades").insert([
    {
      company_id: 1000,
      nombre_especialidad: "Gasista",
    },
    {
      company_id: 1000,
      nombre_especialidad: "Plomeria",
    },
    {
      company_id: 1000,
      nombre_especialidad: "Electricidad",
    },
    {
      company_id: 1000,
      nombre_especialidad: "Fumigacion",
    },
    {
      company_id: 1001,
      nombre_especialidad: "PM",
    },
    {
      company_id: 1001,
      nombre_especialidad: "UX/UI",
    },
    {
      company_id: 1001,
      nombre_especialidad: "Diseñador",
    },
  ]);
};
