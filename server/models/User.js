import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema(
  {
    label: { type: String, enum: ['home', 'work', 'other'], default: 'home' },
    street: { type: String },
    city: { type: String },
    state: { type: String },
    pincode: { type: String },
    location: {
      type: { type: String, default: 'Point' },
      coordinates: [Number],
    },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    phone: { type: String, default: null },
    role: { type: String, enum: ['customer', 'restaurant_owner', 'admin'], default: 'customer' },
    savedAddresses: [addressSchema],
    profilePicture: { type: String, default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  return obj;
};

export default mongoose.model('User', userSchema);
