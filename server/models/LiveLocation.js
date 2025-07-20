const mongoose = require("mongoose");

const liveLocationSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  latitude: {
    type: Number,
    required: true
  },
  longitude: {
    type: Number,
    required: true
  },
  updatedAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Index for efficient queries and cleanup
liveLocationSchema.index({ userId: 1, updatedAt: -1 });

// Auto-delete documents older than 30 minutes
liveLocationSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 1800 });

const LiveLocation = mongoose.model("LiveLocation", liveLocationSchema);

module.exports = LiveLocation; 