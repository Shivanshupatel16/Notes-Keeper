import Tenant from '../models/Tenant.js';
import User from '../models/User.js';

export const upgrade = async (req, res) => {
  try {
    const { tenantId, role } = req.auth;

    if (role !== 'ADMIN') return res.status(403).json({ error: 'Admin only' });

    const tenant = await Tenant.findById(tenantId);
    if (!tenant) return res.status(404).json({ error: 'Tenant not found' });

    if (tenant.plan === 'PRO') {
      return res.status(400).json({ error: 'Tenant is already on PRO plan' });
    }

    tenant.plan = 'PRO';
    await tenant.save();

    res.json({ message: 'Tenant upgraded to PRO plan', plan: tenant.plan });
  } catch (err) {
    console.error('Upgrade error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const downgrade = async (req, res) => {
  try {
    const { tenantId, role } = req.auth;

    if (role !== 'ADMIN') return res.status(403).json({ error: 'Admin only' });

    const tenant = await Tenant.findById(tenantId);
    if (!tenant) return res.status(404).json({ error: 'Tenant not found' });

    tenant.plan = 'FREE';
    await tenant.save();

    res.json({ message: 'Tenant downgraded to Free plan', plan: tenant.plan });
  } catch (err) {
    console.error('Downgrade error:', err);
    res.status(500).json({ error: 'Could not downgrade tenant' });
  }
};

export const meta = async (req, res) => {
  try {
    const { tenantId } = req.auth;
    const tenant = await Tenant.findById(tenantId).select('name slug plan');
    if (!tenant) return res.status(404).json({ error: 'Tenant not found' });
    res.json(tenant);
  } catch (err) {
    console.error('Meta error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};


export const users = async (req, res) => {
  try {
    let tenantId;

    if (req.params.slug) {
      const tenant = await Tenant.findOne({ slug: req.params.slug });
      if (!tenant) return res.status(404).json({ error: 'Tenant not found' });
      tenantId = tenant._id;
    } else {
      tenantId = req.auth.tenantId;
    }

    const tenantUsers = await User.find({ tenantId }).select('-password');
    res.json(tenantUsers.length ? tenantUsers : []);
  } catch (err) {
    console.error('Users error:', err);
    res.status(500).json({ error: 'Could not fetch users' });
  }
};
