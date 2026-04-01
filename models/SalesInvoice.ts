import { Schema, model, models } from 'mongoose';

const SalesInvoiceSchema = new Schema({
  invoiceNumber: { type: String, unique: true, required: true },
  customer: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
  date: { type: Date, default: Date.now },
  items: [
    {
      product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
      qtyCartons: { type: Number, default: 0 },
      qtyPieces: { type: Number, default: 0 },
      unitPrice: { type: Number, required: true },
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
  totalManufacturingCost: { type: Number, required: true }, // For profit analysis
}, { timestamps: true });

export default models.SalesInvoice || model('SalesInvoice', SalesInvoiceSchema);
