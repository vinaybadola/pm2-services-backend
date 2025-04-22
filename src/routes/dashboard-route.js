import express from 'express';
const router = express.Router();

import DashboardController from '../controllers/dashboard-controller.js';
const dashboardController = new DashboardController();

import customAuth from '../middleware/auth-middleware.js';

router.get('/processes', customAuth,dashboardController.getAllProcesses);
router.post('/process/start', customAuth,dashboardController.startProcess);
router.post('/process/restart', customAuth,dashboardController.restartProcess);
router.post('/process/stop', customAuth,dashboardController.stopProcess);
router.post('/process/delete',customAuth, dashboardController.deleteProcess);

router.get('/process/:name',customAuth, dashboardController.getProcess);
router.get('/process-by-id/:uuid', customAuth,dashboardController.getProcessMetadata);
router.get('/process/:name/logs',customAuth, dashboardController.getProcessLogs);
router.put('/process/:name/update-meta-data', customAuth,dashboardController.updateProcessMetadata);

router.post('/restart-all',customAuth, dashboardController.restartAllProcesses);
router.post('/stop-all', customAuth,dashboardController.stopAllProcesses);
router.post('/delete-all',customAuth, dashboardController.deleteAllProcesses);

export default router;