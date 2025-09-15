import express from 'express'
const authRoutes = express.Router();
import login from '../controllers/authController.js';

authRoutes.post('/login', login);

export default authRoutes
