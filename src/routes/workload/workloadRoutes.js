const express = require("express");
const router = express.Router();
const workloadController = require("../../controllers/WorkloadController");
const authUserWithStatus = require("../../middlewares/authUserWithStatus");

router.get("/workload/estado", authUserWithStatus({ roles: ["profesional"] }), workloadController.getWorkloadState);
router.put("/workload/enable", authUserWithStatus({ roles: ["profesional"] }), workloadController.enableWorkload);
router.put("/workload/disable", authUserWithStatus({ roles: ["profesional"] }), workloadController.disableWorkload);

module.exports = router;

