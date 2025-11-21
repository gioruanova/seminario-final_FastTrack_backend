const loginRoutes = require("./login/loginRoutes");
const userRoutes = require("./users/userRoutes");
const profileRoutes = require("./profile/profileRoutes");
const workloadRoutes = require("./workload/workloadRoutes");
const feedbackRoutes = require("./feedback/feedbackRoutes");
const companyRoutes = require("./company/companyRoutes");


function configureRoutes(app) {
  // rutas para login
  app.use(loginRoutes);

  // rutas de funcionalidades core
  app.use(userRoutes);
  app.use(profileRoutes);
  app.use(workloadRoutes);
  app.use(feedbackRoutes);
  app.use(companyRoutes);
}

module.exports = configureRoutes;

