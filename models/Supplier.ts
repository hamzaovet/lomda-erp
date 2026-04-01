import mongoose, { Schema, model, models } from 'mongoose';

const SupplierSchema = new Schema({
  name: { type: String, required: true },
  category: { type: String, enum: ['Raw', 'Finished'], required: true },
  phone: { type: String, required: true },
  currentBalance: { type: Number, default: 0 },
}, { timestamps: true });

export default models.Supplier || model('Supplier', SupplierSchema);
