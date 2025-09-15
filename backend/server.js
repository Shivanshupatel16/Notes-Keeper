import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connect from './db.js';
dotenv.config();

import authRoutes from './routes/auth.js';
import notesRoutes from './routes/notes.js';
import tenantRoutes from './routes/tenants.js';
import userRoutes from './routes/users.js';

const app = express();
const PORT = process.env.PORT;

connect();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/tenants', tenantRoutes);
app.use('/api/users', userRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => console.log(`Backend listening on http://localhost:${PORT}`));
