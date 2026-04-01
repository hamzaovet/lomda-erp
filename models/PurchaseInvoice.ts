import { Schema, model, models } from 'mongoose';

const PurchaseInvoiceSchema = new Schema({
  invoiceNumber: { type: String, unique: true, required: true },
  supplier: { type: Schema.Types.ObjectId, ref: 'Supplier', required: true },
  date: { type: Date, default: Date.now },
  items: [
    {
      itemId: { type: Schema.Types.ObjectId, required: true, refPath: 'items.onModel' }, // Standardize to itemId
      onModel: { type: String, required: true, enum: ['RawMaterial', 'Product'] }, // The collection reference
      qty: { type: Number, required: true },
      price: { type: Number, required: true },
      lineTotal: { type: Number, required: true },
    }
  ],
  totalAmount: { type: Number, required: true },
  amountPaid: { type: Number, default: 0 },
  paymentMethod: { 
    type: String, 
    enum: ['Cash', 'Transfer', 'Check', 'Credit'], 
    default: 'Cash' 
  },
  invoiceType: { type: String, enum: ['invoice', 'return'], default: 'invoice' },
  dueDate: { type: Date },
}, { timestamps: true });

export default models.PurchaseInvoice || model('PurchaseInvoice', PurchaseInvoiceSchema);
