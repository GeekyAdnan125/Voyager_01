const mongoose = require("mongoose");
const Hotel = require("../models/HotelSchema");
const Room = require("../models/rooms");
const User = require("../models/UserSchema");
const bookingSchema = new mongoose.Schema({
    hoteldetails: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Hotel",
        required: true,
    },
    persons: Number,
    user_Name:String,
    user_email: String,
    user_phone : String,
    room_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Room",
        required: true,
    },
    room_type: String,
    hotel_name: String,
    booking_id: String,
    booking_date: Date,
    check_in_date: Date,
    check_out_date: Date,
    booking_status: String,
}, { timestamps: true });
module.exports = mongoose.model("Booking", bookingSchema);
