import mongoose from 'mongoose';

const operatingHoursSchema = new mongoose.Schema(
  {
    day: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    },
    isOpen: { type: Boolean, default: true },
    openTime: { type: Number },
    closeTime: { type: Number },
  },
  { _id: false }
);

const restaurantSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String },
    cuisineTypes: [String],
    coverImage: { type: String },
    logo: { type: String },
    bannerImage: { type: String },
    address: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      pincode: { type: String },
    },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true },
    },
    operatingHours: [operatingHoursSchema],
    delivery: {
      radiusKm: { type: Number, default: 5 },
      baseCharge: { type: Number, default: 0 },
      freeThreshold: { type: Number },
      estimatedMinutes: { type: Number },
    },
    settings: {
      legalEntityType:      { type: String },
      ownerName:            { type: String },
      panNumber:            { type: String },
      gstNumber:            { type: String },
      gstPercent:           { type: Number, default: 5 },
      serviceChargePercent: { type: Number, default: 10 },
      healthPermitId:       { type: String },
      licenseExpiry:        { type: Date },
      registrationNo:       { type: String },
      tradeLicenseExpiry:   { type: Date },
    },
    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
    avgRating: { type: Number, default: 0, min: 0, max: 5 },
    totalRatings: { type: Number, default: 0 },
  },
  { timestamps: true }
);

restaurantSchema.index({ location: '2dsphere' });
restaurantSchema.index({ name: 'text', description: 'text' });
restaurantSchema.index({ ownerId: 1 });

export default mongoose.model('Restaurant', restaurantSchema);
