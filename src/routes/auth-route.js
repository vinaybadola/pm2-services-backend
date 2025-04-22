import express from 'express';
const router = express.Router();

import customAuth from '../middleware/auth-middleware.js';

import AuthController from '../controllers/auth-controller.js';
const authController = new AuthController();

router.post('/login', authController.login);
router.post('/signup', authController.signup);
router.get('/logout', customAuth, authController.logout);
router.post("/delete", customAuth, authController.deleteAccount);

export default router;