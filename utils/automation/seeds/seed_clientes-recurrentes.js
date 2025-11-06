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
          cliente_dni: "12123123",
          cliente_phone: "+5491144556633",
          cliente_email: "cliente-1@gmailcom",
          cliente_direccion: "Instituto Leonardo Da Vinci, 2037, Avenida Corrientes, Balvanera, Buenos Aires, Comuna 3, Autonomous City of Buenos Aires",
          cliente_lat: -34.6043714,
          cliente_lng: -58.3960032,
          company_id: 1000,
        },
        {
          cliente_complete_name: "Administracion Vehicular S.A.",
          cliente_dni: "13456789",
          cliente_phone: "+5491144556633",
          cliente_email: "cliente-abcd@gmailcom",
          cliente_direccion: "Av. Juramento 2040, C1428DNH Cdad. Autónoma de Buenos Aires",
          cliente_lat: -34.56013275322037,
          cliente_lng: -58.453360047267296,
          company_id: 1000,
        },
        {
          cliente_complete_name: "Luis Gomez (auditor dedicado)",
          cliente_dni: "3020121231239",
          cliente_phone: "+5491144556633",
          cliente_email: "cliente-2@gmailcom",
          cliente_direccion: "Av. Corrientes 1233, C1043 AAM, Cdad. Autónoma de Buenos Aires",
          cliente_lat: -34.60368081844826,
          cliente_lng: -58.384162189594015,
          company_id: 1001,
        },
        {
          cliente_complete_name: "Empresa ABC",
          cliente_dni: "20202024648",
          cliente_phone: "+5491144556633",
          cliente_email: "cliente-3@gmailcom",
          cliente_direccion: "Gral. Juan Lavalle 1100-1002, B1638COF Vicente López, Provincia de Buenos Aires",
          cliente_lat: -34.52991957089025, 
          cliente_lng: -58.47346787824439,
          company_id: 1002,
        },
      ])
    );
};
