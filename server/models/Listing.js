import mongoose from 'mongoose';
import {
  LISTING_CATEGORIES,
  LISTING_CONDITIONS,
  LISTING_STATUSES,
} from '../utils/constants.js';

const listingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [4, 'Title must be at least 4 characters'],
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [20, 'Description must be at least 20 characters'],
      maxlength: [3000, 'Description cannot exceed 3000 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
      max: [1000000, 'Price cannot exceed ₹10,00,000'],
    },
    category: {
      type: String,
      required: true,
      enum: LISTING_CATEGORIES,
      index: true,
    },
    condition: {
      type: String,
      required: true,
      enum: LISTING_CONDITIONS,
    },
    images: {
      type: [String],
      default: [],
      validate: {
        validator(images) {
          return images.length <= 6;
        },
        message: 'A listing can have at most 6 images',
      },
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    college: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
      index: true,
    },
    pickupLocation: {
      type: String,
      trim: true,
      maxlength: 120,
      default: '',
    },
    isNegotiable: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: LISTING_STATUSES,
      default: 'pending',
      index: true,
    },
    rejectionReason: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
    },
    moderatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    moderatedAt: {
      type: Date,
      default: null,
    },
    soldAt: {
      type: Date,
      default: null,
    },
    views: {
      type: Number,
      default: 0,
      min: 0,
    },
    reportCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

listingSchema.index({ status: 1, category: 1, createdAt: -1 });
listingSchema.index({ status: 1, price: 1 });
listingSchema.index({ seller: 1, status: 1, createdAt: -1 });
listingSchema.index({ title: 'text', description: 'text', category: 'text' });

export const Listing = mongoose.model('Listing', listingSchema);
