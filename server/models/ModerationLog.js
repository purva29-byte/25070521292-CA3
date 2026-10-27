import mongoose from 'mongoose';

const moderationLogSchema = new mongoose.Schema(
  {
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
      default: null,
      index: true,
    },
    targetUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        'approve_listing',
        'reject_listing',
        'remove_listing',
        'restore_listing',
        'resolve_report',
        'dismiss_report',
        'suspend_user',
        'reactivate_user',
      ],
    },
    reason: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: '',
    },
  },
  { timestamps: true }
);

moderationLogSchema.index({ createdAt: -1 });

export const ModerationLog = mongoose.model('ModerationLog', moderationLogSchema);
