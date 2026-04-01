import mongoose, { Schema, model, models } from 'mongoose';

const TransactionSchema = new Schema({
  type: { type: String, enum: ['Sale', 'Purchase', 'Expense', 'Salary', 'Payment'], required: true },
  amount: { type: Number, required: true }, // The Primary amount (for Purchase/Sale, this is the TOTAL)
  amountPaid: { type: Number, default: 0 }, // How much was actually paid/received
  paymentMethod: { type: String, enum: ['Cash', 'Check', 'Transfer', 'N/A'], default: 'N/A' },
  dueDate: { type: Date },
  partyId: { type: Schema.Types.ObjectId, refPath: 'partyModel', required: true },
  partyModel: { type: String, enum: ['Supplier', 'Customer'], required: true },
  description: { type: String, required: true },
  date: { type: Date, default: Date.now },
}, { timestamps: true });

export default models.Transaction || model('Transaction', TransactionSchema);
