import { Schema, model, models } from 'mongoose';

const CustomerSchema = new Schema({
  name: { type: String, required: true },
  phone: { type: String },
  address: { type: String },
  pricingTier: { 
    type: String, 
    enum: ['قطاعي', 'جملة', 'موزع', 'مندوب'], 
    default: 'قطاعي' 
  },
  customerType: { 
    type: String, 
    enum: ['external', 'internal_branch'], 
    default: 'external' 
  },
  currentBalance: { type: Number, default: 0 },
}, { timestamps: true });

export default models.Customer || model('Customer', CustomerSchema);
