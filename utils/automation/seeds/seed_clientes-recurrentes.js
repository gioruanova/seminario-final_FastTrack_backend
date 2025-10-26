const bcrypt = require("bcrypt");
const saltRounds = 10;

exports.seed = function (knex) {
  return knex("clientes_recurrentes")
    .del()
    .then(() =>
      knex.raw("ALTER TABLE clientes_recurrentes AUTO_INCREMENT = 9000")
    )
    .then(() =>
      knex("clientes_recurrentes").insert([
        {
          cliente_complete_name: "Universidad Da vinci",
          cliente_dni: "123456",
          cliente_phone: "123456789",
          cliente_email: "cliente-1@gmailcom",
          cliente_direccion: "Instituto Leonardo Da Vinci, 2037, Avenida Corrientes, Balvanera, Buenos Aires, Comuna 3, Autonomous City of Buenos Aires",
          cliente_lat: -34.6043714,
          cliente_lng: -58.3960032,
          company_id: 1000,
        },
        {
          cliente_complete_name: "Universidad Nacional CABA",
          cliente_dni: "789012",
          cliente_phone: "123456789",          
          cliente_email: "cliente-abcd@gmailcom",
          cliente_direccion: "LM Campos 2120",
          cliente_lat: -34.604302546035875,
          cliente_lng: -58.396008763217424,
          company_id: 1000,
        },
        {
          cliente_complete_name: "Luis Gomez (auditor dedicado",
          cliente_dni: "654321",          
          cliente_phone: "123456789",
          cliente_email: "cliente-2@gmailcom",
          cliente_direccion: "Belgrano 1500 capital federal",
          cliente_lat: -34.61348577592298,
          cliente_lng: -58.38739053913765,
          company_id: 1001,
        },
        {
          cliente_complete_name: "Empresa ABC",
          cliente_dni: "45454456",
          cliente_phone: "123456789",
          cliente_email: "cliente-3@gmailcom",
          cliente_direccion: "Av. Córdoba 4520",
          cliente_lat: -34.594739735946966,
          cliente_lng: -58.42954895880566,
          company_id: 1002,
        },
      ])
    );
};
