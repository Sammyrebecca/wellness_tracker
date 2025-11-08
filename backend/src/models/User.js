const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const PreferencesSchema = new mongoose.Schema(
  {
    focusArea: { type: String },
    reminderTime: { type: String }, // HH:mm
    darkMode: { type: Boolean, default: false },
    stepGoal: { type: Number, min: 0, max: 200000, default: 10000 },
    waterGoal: { type: Number, min: 0, max: 15, default: 3 },
    sleepGoal: { type: Number, min: 0, max: 24, default: 7 }
  },
  { _id: false }
);

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    preferences: { type: PreferencesSchema, default: () => ({}) },
    streak: { type: Number, default: 0 }
  },
  { timestamps: true }
);

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const saltRounds = 12;
  this.password = await bcrypt.hash(this.password, saltRounds);
  next();
});

UserSchema.methods.toJSON = function () {
  const obj = this.toObject({ versionKey: false });
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', UserSchema);
