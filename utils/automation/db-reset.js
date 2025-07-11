require("dotenv").config();

const knex = require("knex")({
  client: "mysql2",
  connection: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  },
});

const dbName = process.env.DB_NAME;

(async () => {
  try {
    await knex.raw(`DROP DATABASE IF EXISTS \`${dbName}\``);
    console.log(`✔️ Database ${dbName} deleted.`);

    await knex.raw(`CREATE DATABASE \`${dbName}\``);
    console.log(`✅ Database ${dbName} created.`);
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await knex.destroy();
  }
})();
