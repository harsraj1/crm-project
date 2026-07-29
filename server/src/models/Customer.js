import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name required'],
    trim: true,
    maxlength: [50, 'First name too long']
  },
  lastName: {
    type: String,
    required: [true, 'Last name required'],
    trim: true,
    maxlength: [50, 'Last name too long']
  },
  email: {
    type: String,
    required: [true, 'Email required'],
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email']
  },
  phone: { type: String, trim: true },
  company: { type: String, trim: true, maxlength: [100, 'Company name too long'] },
  status: {
    type: String,
    enum: ['prospect', 'active', 'inactive', 'churned'],
    default: 'prospect'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  tags: [{ type: String, trim: true }],
  notes: { type: String, maxlength: [5000, 'Notes too long'] },
  lifetimeValue: { type: Number, default: 0, min: 0 },
  lastContacted: Date,
  nextFollowUp: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

customerSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

customerSchema.index({ email: 1 });
customerSchema.index({ status: 1 });
customerSchema.index({ assignedTo: 1 });

export const Customer = mongoose.model('Customer', customerSchema);
export default Customer;