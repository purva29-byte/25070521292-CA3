import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
      required: true,
      index: true,
    },
    participantKey: {
      type: String,
      required: true,
      unique: true,
    },
    lastMessage: {
      type: String,
      default: '',
      maxlength: 2000,
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

conversationSchema.index({ participants: 1, lastMessageAt: -1 });
conversationSchema.path('participants').validate(function validateParticipants(participants) {
  return Array.isArray(participants) && participants.length === 2;
}, 'A conversation must have exactly two participants');

export const Conversation = mongoose.model('Conversation', conversationSchema);
