const loginRoutes = require("./login/loginRoutes");
const userRoutes = require("./users/userRoutes");
const profileRoutes = require("./profile/profileRoutes");
const workloadRoutes = require("./workload/workloadRoutes");
const feedbackRoutes = require("./feedback/feedbackRoutes");
const companyRoutes = require("./company/companyRoutes");
const especialidadesRoutes = require("./especialidades/especialidadesRoutes");
const profesionalEspecialidadRoutes = require("./profesionalEspecialidad/profesionalEspecialidadRoutes");
const notificationsRoutes = require("./notifications/notificationsRoutes");
const clientesRecurrentesRoutes = require("./clientesRecurrentes/clientesRecurrentesRoutes");

function configureRoutes(app) {
  app.use(loginRoutes);
  app.use(userRoutes);
  app.use(profileRoutes);
  app.use(workloadRoutes);
  app.use(feedbackRoutes);
  app.use(companyRoutes);
  app.use(especialidadesRoutes);
  app.use(profesionalEspecialidadRoutes);
  app.use(notificationsRoutes);
  app.use(clientesRecurrentesRoutes);
}

module.exports = configureRoutes;