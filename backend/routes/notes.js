import express from 'express';
import { list, create, get, update, remove } from '../controllers/notesController.js';
import { requireAuth } from '../middleware/auth.js';

const notesRoutes = express.Router();

notesRoutes.get('/', requireAuth,list);
notesRoutes.post('/', requireAuth,create);
notesRoutes.get('/:id', requireAuth,get);
notesRoutes.put('/:id', requireAuth,update);
notesRoutes.delete('/:id', requireAuth,remove);

export default notesRoutes;
