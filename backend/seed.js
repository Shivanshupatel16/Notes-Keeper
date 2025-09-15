import mongoose from 'mongoose';
import connect from './db.js';
import User from './models/User.js'
import Tenant from './models/Tenant.js';
import bcrypt from 'bcrypt';

async function seed() {
  await connect();
  await Tenant.deleteMany({}).catch(()=>{});
  await User.deleteMany({}).catch(()=>{});

  const password = await bcrypt.hash('password', 10);

  const acme = new Tenant({ name: 'Acme', slug: 'acme', plan: 'FREE' });
  const globex = new Tenant({ name: 'Globex', slug: 'globex', plan: 'FREE' });
  await acme.save();
  await globex.save();

  await User.create({ email: 'admin@acme.test', password, role: 'ADMIN', tenantId: acme._id, name: 'Acme Admin' });
  await User.create({ email: 'user@acme.test', password, role: 'MEMBER', tenantId: acme._id, name: 'Acme User' });

  await User.create({ email: 'admin@globex.test', password, role: 'ADMIN', tenantId: globex._id, name: 'Globex Admin' });
  await User.create({ email: 'user@globex.test', password, role: 'MEMBER', tenantId: globex._id, name: 'Globex User' });

  console.log('Seed finished.');
  mongoose.connection.close();
}

seed().catch(e => { console.error(e); process.exit(1); });
