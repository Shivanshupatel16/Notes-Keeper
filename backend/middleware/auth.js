import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET;

function getAuthFromHeader(req) {
  const h = req.headers.authorization || req.headers.Authorization;
  if (!h) return null;
  const m = h.match(/^Bearer (.+)$/);
  if (!m) return null;
  try { return jwt.verify(m[1], JWT_SECRET); } catch (e) { return null; }
}

export const requireAuth = (req, res, next) => {
  const payload = getAuthFromHeader(req);
  if (!payload) return res.status(401).json({ error: 'Unauthorized' });
  req.auth = payload;
  next();
};

export const requireRole = (role) => (req, res, next) => {
  const payload = getAuthFromHeader(req);
  if (!payload) return res.status(401).json({ error: 'Unauthorized' });
  if (payload.role !== role) return res.status(403).json({ error: 'Forbidden' });
  req.auth = payload;
  next();
};
