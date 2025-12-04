const mongoose = require('mongoose');

const EntrySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    date: { type: Date, required: true, index: true }, // normalized startOfDay (UTC)
    mood: { type: Number, required: true, min: 1, max: 5 },
    moodEmoji: { type: String, default: 'N/A' }, // emoji representation of mood
    sleep: { type: Number, required: true, min: 0, max: 24 },
    steps: { type: Number, required: true, min: 0, max: 200000 },
    water: { type: Number, required: true, min: 0, max: 15 },
    notes: { type: String, maxlength: 1000 },
    journal: { type: String, maxlength: 5000 }, // detailed mood journal entry
    tags: [{ type: String }], // user-defined tags for entries
    checkedInAt: { type: Date, default: Date.now } // exact time of check-in
  },
  { timestamps: true }
);

EntrySchema.index({ userId: 1, date: -1 });
EntrySchema.index({ userId: 1, date: 1 }, { unique: true }); // enforce 1 per day per user

module.exports = mongoose.model('Entry', EntrySchema);
