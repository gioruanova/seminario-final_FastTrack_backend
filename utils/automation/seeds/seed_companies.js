exports.seed = async function (knex) {
  await knex("companies").del();
  await knex.raw("ALTER TABLE companies AUTO_INCREMENT = 1000");

  await knex("companies").insert([
    {
      company_unique_id: "123456789",
      company_nombre: "Consorcio Belgrano",
      company_phone: "1112345678",
      company_whatsapp: "+541112345678",
      company_telegram: "+541112345678",
      company_email: "contacto@consorciobelgrano.com",
      company_estado: true,
      limite_operadores: 3,
      limite_profesionales: 15,
      limite_especialidades: 10,
      reminder_manual: 1
    },
    {
      company_unique_id: "987654321",
      company_nombre: "Davinci",
      company_phone: "1198765432",
      company_whatsapp: "+541198765432",
      company_telegram: "+541198765432",
      company_email: "contacto@davinci.com",
      company_estado: true,
      limite_operadores: 3,
      limite_profesionales: 15,
      limite_especialidades: 10,
      reminder_manual: 1
    },
    {
      company_unique_id: "564738291",
      company_nombre: "Electronica Moreno",
      company_phone: "1145678901",
      company_whatsapp: "+541145678901",
      company_telegram: "+541145678901",
      company_email: "contacto@electronicamoreno.com",
      company_estado: true,
      limite_operadores: 3,
      limite_profesionales: 15,
      limite_especialidades: 10,
      reminder_manual: 1
    },
    {
      company_unique_id: "111222333",
      company_nombre: "Renovar Gym",
      company_phone: "1156789012",
      company_whatsapp: "+541156789012",
      company_telegram: "+541156789012",
      company_email: "contacto@renovargym.com",
      company_estado: true,
      limite_operadores: 3,
      limite_profesionales: 15,
      limite_especialidades: 10,
      reminder_manual: 1
    }
  ]);
};
