require("dotenv").config();
const dbConfig = require("../../config/dbConnection");

const knex = require("knex")({
  client: "mysql2",
  connection: {
    database: dbConfig.database,
    host: dbConfig.host,
    user: dbConfig.username,
    password: dbConfig.password,
  },
  seeds: {
    directory: "./utils/automation/seeds",
  },
});

const seeders = [
  "seed_companies.js",
  "seed_users.js",

  
  
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
