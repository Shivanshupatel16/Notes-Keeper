import User from '../models/User.js'
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const JWT_SECRET = process.env.JWT_SECRET ;

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign(
    { userId: user._id, tenantId: user.tenantId, role: user.role },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  const { _id, role, tenantId } = user;
  res.json({
    token,
    user: {
      id: _id,
      email: user.email,
      role,
      tenantId
    }
  });
};

export default login;
