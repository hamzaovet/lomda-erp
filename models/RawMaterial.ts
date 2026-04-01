import { Schema, model, models } from 'mongoose';

const RawMaterialSchema = new Schema({
  name: { type: String, required: true },
  code: { type: String, unique: true, required: true },
  unit: { type: String, enum: ['Kg', 'Liter'], required: true },
  stockQty: { type: Number, default: 0 },
  minLevel: { type: Number, required: true },
  avgCost: { type: Number, default: 0 },
}, { timestamps: true });

export default models.RawMaterial || model('RawMaterial', RawMaterialSchema);
