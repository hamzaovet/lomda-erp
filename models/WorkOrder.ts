import mongoose, { Schema, model, models } from 'mongoose';

const WorkOrderSchema = new Schema({
  orderNumber: { type: String, unique: true, required: true },
  status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
  actualYield: { type: Number, default: 0 },
  normalSpoilage: { type: Number, default: 0 },
  abnormalSpoilage: { type: Number, default: 0 },
  abnormalLossValue: { type: Number, default: 0 },
  materialsUsed: [
    {
      materialId: { type: Schema.Types.ObjectId, ref: 'RawMaterial', required: true },
      qty: { type: Number, required: true },
    }
  ],
  outputProduct: {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    qty: { type: Number, required: true },
  },
  additionalCosts: { type: Number, default: 0 },
}, { timestamps: true });

if (mongoose.models.WorkOrder) {
  delete mongoose.models.WorkOrder;
}

export default models.WorkOrder || model('WorkOrder', WorkOrderSchema);
