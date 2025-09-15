import Note from '../models/Note.js';
import Tenant from '../models/Tenant.js';

export const list = async (req, res) => {
  const { tenantId } = req.auth;
  const notes = await Note.find({ tenantId }).sort({ createdAt: -1 });
  res.json(notes);
};

export const create = async (req, res) => {
  const { tenantId, userId } = req.auth;
  const { title, content } = req.body;
  if (!title) return res.status(400).json({ error: 'Title required' });

  const tenant = await Tenant.findById(tenantId);
  if (!tenant) return res.status(400).json({ error: 'Tenant not found' });

  if (tenant.plan === 'FREE') {
    const count = await Note.countDocuments({ tenantId });
    if (count >= 3) return res.status(403).json({ error: 'Free plan limit reached' });
  }

  const note = await Note.create({ title, content: content || '', tenantId, ownerId: userId });
  res.status(201).json(note);
};

export const get = async (req, res) => {
  const { tenantId } = req.auth;
  const { id } = req.params;
  const note = await Note.findOne({ _id: id, tenantId });
  if (!note) return res.status(404).json({ error: 'Note not found' });
  res.json(note);
};

export const update = async (req, res) => {
  const { tenantId } = req.auth;
  const { id } = req.params;
  const { title, content } = req.body;
  const note = await Note.findOneAndUpdate({ _id: id, tenantId }, { title, content }, { new: true });
  if (!note) return res.status(404).json({ error: 'Not found or not your tenant' });
  res.json(note);
};

export const remove = async (req, res) => {
  const { tenantId } = req.auth;
  const { id } = req.params;
  await Note.deleteMany({ _id: id, tenantId });
  res.json({ success: true });
};
