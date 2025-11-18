require("dotenv").config();
const dbConfig = require("../../config/dbConnection");

const knex = require("knex")({
  client: "mysql2",
  connection: {
    host: dbConfig.host,
    port: dbConfig.port, // <-- esto te falta
    user: dbConfig.username,
    password: dbConfig.password,
    database: dbConfig.database,
    ssl: dbConfig.useSSL === "true", // opcional si Railway lo requiere
  },
  seeds: {
    directory: "./utils/automation/seeds",
  },
});


const seeders = [
  "seed_companies.js",
  "seed_companies_config.js",
  "seed_users.js",
  "seed_especialidades.js",
  "seed_clientes-recurrentes.js",
];

async function runSeeders() {
  try {
    for (const seeder of seeders) {
      console.log(`\nRunning seeders: ${seeder}`);
      await knex.seed.run({
        specific: seeder,
      });
      console.log(`${seeder} done`);
    }
    console.log("\n>> Seeders completed\n");
  } catch (error) {
    console.error("Error running seeders:", error);
  } finally {
    knex.destroy();
  }
}

runSeeders();
