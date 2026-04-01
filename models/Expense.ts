import mongoose, { Schema, model, models } from 'mongoose';

const ExpenseSchema = new Schema({
  amount: { 
    type: Number, 
    required: true 
  },
  category: { 
    type: String, 
    enum: ['رواتب', 'إيجار', 'مرافق', 'تسويق', 'نثريات', 'أخرى'], 
    default: 'نثريات',
    required: true
  },
  description: { 
    type: String, 
    required: true 
  },
  date: { 
    type: Date, 
    default: Date.now 
  }
}, { timestamps: true });

export default models.Expense || model('Expense', ExpenseSchema);
