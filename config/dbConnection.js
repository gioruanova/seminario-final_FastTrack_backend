require("dotenv").config();

const isLocalhost = process.env.DB_HOST === "localhost";

module.exports = {
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: "mysql",
  logging: false,
  dialectOptions: isLocalhost ? {} : {
    ssl: {
      rejectUnauthorized: false,
    },
  }
};
