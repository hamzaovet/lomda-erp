import mongoose, { Schema, model, models } from 'mongoose';

const TreasuryTransactionSchema = new Schema({
  type: { 
    type: String, 
    enum: ['in', 'out'], 
    required: true 
  },
  amount: { 
    type: Number, 
    required: true 
  },
  category: { 
    type: String, 
    enum: ['sales_revenue', 'purchase_payment', 'expense', 'capital', 'other', 'customer_payment', 'supplier_payment'],
    required: true
  },
  description: { 
    type: String 
  },
  date: { 
    type: Date, 
    default: Date.now 
  }
}, { timestamps: true });

export default models.TreasuryTransaction || model('TreasuryTransaction', TreasuryTransactionSchema);
