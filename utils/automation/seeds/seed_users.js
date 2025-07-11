const bcrypt = require("bcrypt");
const saltRounds = 10;

exports.seed = function (knex) {
  return knex("users")
    .del()
    .then(() => knex.raw("ALTER TABLE users AUTO_INCREMENT = 1000"))
    .then(() =>
      knex("users").insert([
        {
          user_complete_name: "Owner 1",
          user_email: "owner@gmail.com",
          user_dni: "123456",
          user_phone: "123456789",
          user_role: "owner",
          user_password: bcrypt.hashSync("123456", saltRounds),
          user_status: true,
          company_id: 1000,
        },
                {
          user_complete_name: "Owner 2",
          user_email: "owner-2@gmail.com",
          user_dni: "12345678978",
          user_phone: "123456789",
          user_role: "owner",
          user_password: bcrypt.hashSync("123456", saltRounds),
          user_status: true,
          company_id: 1001,
        },
        {
          user_complete_name: "Operador 1",
          user_email: "operador-1@gmail.com",
          user_dni: "11111",
          user_phone: "123456789",
          user_role: "operador",
          user_password: bcrypt.hashSync("123456", saltRounds),
          user_status: true,
          company_id: 1000,
        },
        {
          user_complete_name: "Operador 2",
          user_email: "operador-2@gmail.com",
          user_dni: "44444",
          user_phone: "123456789",
          user_role: "operador",
          user_password: bcrypt.hashSync("123456", saltRounds),
          user_status: true,
          company_id: 1000,
        },
        {
          user_complete_name: "Profesional 1",
          user_email: "profesional-2@gmail.com",
          user_dni: "5555",
          user_phone: "123456789",
          user_role: "operador",
          user_password: bcrypt.hashSync("123456", saltRounds),
          user_status: true,
          company_id: 1000,
        },
      ])
    );
};
