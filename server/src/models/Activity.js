import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['call', 'email', 'meeting', 'note', 'task'],
    required: true
  },
  subject: {
    type: String,
    required: true,
    maxlength: [200, 'Subject too long']
  },
  description: { type: String, maxlength: [5000, 'Description too long'] },
  duration: { type: Number, min: 0 },
  outcome: { type: String, maxlength: [500, 'Outcome too long'] },
  lead: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

activitySchema.index({ lead: 1, createdAt: -1 });
activitySchema.index({ user: 1, createdAt: -1 });

export const Activity = mongoose.model('Activity', activitySchema);
export default Activity;