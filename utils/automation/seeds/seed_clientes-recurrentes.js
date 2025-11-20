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
          cliente_direccion: "Corrientes 850, Capital Federal, Buenos Aires, Argentina",
          cliente_lat: -34.6043714,
          cliente_lng: -58.3960032,
          company_id: 1000,
        },
        {
          cliente_complete_name: "Administracion Vehicular S.A.",
          cliente_dni: "13456789",
          cliente_phone: "+5491144556633",
          cliente_email: "cliente-abcd@gmailcom",
          cliente_direccion: "Cordoba 3540, Capital Federal, Buenos Aires, Argentina",
          cliente_lat: -34.56013275322037,
          cliente_lng: -58.453360047267296,
          company_id: 1000,
        },
        {
          cliente_complete_name: "Luis Gomez (auditor dedicado)",
          cliente_dni: "3020121231239",
          cliente_phone: "+5491144556633",
          cliente_email: "cliente-2@gmailcom",
          cliente_direccion: "San Juan 1300, Capital Federal, Buenos Aires, Argentina",
          cliente_lat: -34.60368081844826,
          cliente_lng: -58.384162189594015,
          company_id: 1001,
        },
        {
          cliente_complete_name: "Empresa ABC",
          cliente_dni: "20202024648",
          cliente_phone: "+5491144556633",
          cliente_email: "cliente-3@gmailcom",
          cliente_direccion: "Juramento 4000, Capital Federal, Buenos Aires, Argentina",
          cliente_lat: -34.52991957089025, 
          cliente_lng: -58.47346787824439,
          company_id: 1002,
        },
      ])
    );
};
