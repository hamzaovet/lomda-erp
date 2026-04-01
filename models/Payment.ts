import mongoose, { Schema, model, models } from 'mongoose';

const PAYMENT_METHODS = ['نقدي', 'تحويل بنكي', 'شيك'];

const CustomerPaymentSchema = new Schema({
  customer: { 
    type: Schema.Types.ObjectId, 
    ref: 'Customer', 
    required: true 
  },
  amount: { 
    type: Number, 
    required: true 
  },
  date: { 
    type: Date, 
    default: Date.now 
  },
  description: { 
    type: String 
  },
  paymentMethod: { 
    type: String, 
    enum: PAYMENT_METHODS, 
    default: 'نقدي' 
  }
}, { timestamps: true });

const SupplierPaymentSchema = new Schema({
  supplier: { 
    type: Schema.Types.ObjectId, 
    ref: 'Supplier', 
    required: true 
  },
  amount: { 
    type: Number, 
    required: true 
  },
  date: { 
    type: Date, 
    default: Date.now 
  },
  description: { 
    type: String 
  },
  paymentMethod: { 
    type: String, 
    enum: PAYMENT_METHODS, 
    default: 'نقدي' 
  }
}, { timestamps: true });

export const CustomerPayment = models.CustomerPayment || model('CustomerPayment', CustomerPaymentSchema);
export const SupplierPayment = models.SupplierPayment || model('SupplierPayment', SupplierPaymentSchema);
