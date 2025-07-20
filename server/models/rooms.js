const mongoose = require("mongoose");
const Hotel = require("../models/HotelSchema");

const roomSchema = new mongoose.Schema({
  hotel: String,
  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hotel",
    required: true,
  },
  room_type: String, 
  bookingDetails: [{
    userName: String,
    userEmail: String,
    userPhone: String,
    check_in: Date,
    check_out: Date,
    expires: Number,
    new: {
      type: Boolean,
      default: true
    }
  }]
}, { timestamps: true });

// Important: This is the correct way to export
const Room = mongoose.model("Room", roomSchema);
module.exports = Room;