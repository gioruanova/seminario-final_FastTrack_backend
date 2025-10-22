require("dotenv").config();

module.exports = {
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: "mysql",
  logging: false,
  dialectOptions: {}, // <-- sin ssl
  pool: {
    max: 30,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
};
