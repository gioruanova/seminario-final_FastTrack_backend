const { execSync } = require("child_process");

const runCommand = (command, label) => {
  try {
    console.log(`\n>> ${label}`);
    execSync(command, { stdio: "inherit" });
  } catch (err) {
    console.error(`Error while running: ${command}`);
    process.exit(1);
  }
};

const main = () => {
  runCommand("npx knex migrate:rollback --all", "Rolling back database");
  runCommand("npx knex migrate:latest", "Migrations starting");
  runCommand("node ./utils/automation/run-seeders.js", "Running seeders");
  console.log(">> Database refreshed.\nReady to start\n");
};

main();
