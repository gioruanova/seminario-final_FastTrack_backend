// seeds/01_companies.js
exports.seed = async function (knex) {
  await knex("companies").del();
  await knex.raw("ALTER TABLE companies AUTO_INCREMENT = 1000");

  await knex("companies").insert([
    {
      company_unique_id: "123456789",
      company_nombre: "Empresa-1",
      company_phone: "111-111-111",
      company_whatsapp: "123456789",
      company_telegram: "123456789",
      company_email: "contacto@empresauno.com",
      company_estado: true,
      limite_operadores: 1,
      limite_profesionales: 1,
      reminder_manual: 1
    },
    {
      company_unique_id: "789456123",
      company_nombre: "Empresa-2",
      company_phone: "222-222-222",
      company_whatsapp: "123456789",
      company_telegram: "123456789",
      company_email: "contacto@empresados.com",
      company_estado: true,
      reminder_manual: 0
    },
  ]);
};

