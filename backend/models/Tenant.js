import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const tenantSchema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  plan: { type: String, enum: ['FREE','PRO'], default: 'FREE' },
    users: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],

  createdAt: { type: Date, default: Date.now }
});

const Tenant = mongoose.model('Tenant', tenantSchema);
export default Tenant