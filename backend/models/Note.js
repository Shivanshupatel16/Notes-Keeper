import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const noteSchema = new Schema({
  title: { type: String, required: true },
  content: { type: String, default: '' },
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
  ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

noteSchema.pre('save', function(next) { this.updatedAt = Date.now(); next(); });
noteSchema.pre('findOneAndUpdate', function(next) { this._update.updatedAt = Date.now(); next(); });

const Note = mongoose.model('Note', noteSchema);
export default Note;
