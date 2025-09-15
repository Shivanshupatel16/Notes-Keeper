import express from 'express';
import { upgrade, meta, users, downgrade } from '../controllers/tenantsController.js';
import { requireAuth } from '../middleware/auth.js';

const tenantRoutes = express.Router();

tenantRoutes.post('/:slug/upgrade', requireAuth, upgrade);
tenantRoutes.get('/meta', requireAuth, meta);
// tenantRoutes.get('/:slug/users', requireAuth, users);
tenantRoutes.get('/:slug?/users', requireAuth, users);
tenantRoutes.post('/:slug/downgrade', requireAuth, downgrade);
// tenantRoutes.post('/add',requireAuth, createTenant);

export default tenantRoutes;
