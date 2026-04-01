import { Schema, model, models } from 'mongoose';

const ProductSchema = new Schema({
  name: { type: String, required: true },
  sku: { type: String, unique: true, required: true },
  category: { type: String, required: true },
  stockQty: { type: Number, default: 0 }, // Always stored in Base Units (e.g., pieces)
  packagingSize: { type: Number, default: 1 }, // Items per carton
  baseUnitName: { type: String, default: 'قطعة' }, // e.g., 'قطعة', 'زجاجة'
  costs: {
    manufacturing: { type: Number, default: 0 },
    purchase: { type: Number, default: 0 },
    packagingCost: { type: Number, default: 0 },
    overheadPercentage: { type: Number, default: 0 },
  },
  prices: {
    wholesale: { type: Number, required: true },
    retail: { type: Number, required: true },
    distributor: { type: Number, default: 0 },
    representative: { type: Number, default: 0 },
  },
  cartonPrice: { type: Number, default: 0 },
  unitsPerCarton: { type: Number, default: 1 },
  imageUrl: { type: String, default: "" },
  productType: { type: String, enum: ['manufactured', 'traded'], default: 'manufactured' },
  purchaseCost: { type: Number, default: 0 },
  avgCost: { type: Number, default: 0 },
  formula: [
    {
      materialId: { type: Schema.Types.ObjectId, ref: 'RawMaterial', required: true },
      qtyPerUnit: { type: Number, required: true },
    }
  ],
}, { timestamps: true });

export default models.Product || model('Product', ProductSchema);
