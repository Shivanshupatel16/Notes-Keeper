import express from 'express';
import User from '../models/User.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const userRoutes = express.Router();
userRoutes.get('/', requireAuth, requireRole('ADMIN'), async (req, res) => {
  try {
    const { tenantId } = req.auth;
    const users = await User.find({ tenantId }).select('-password');
    res.json(users);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

export default userRoutes;
