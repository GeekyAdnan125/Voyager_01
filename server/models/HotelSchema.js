const mongoose = require("mongoose");
const Room = require("../models/rooms");
const User = require("../models/UserSchema");
if (mongoose.connection.models["Hotel"]) {
  delete mongoose.connection.models["Hotel"];
}
const hotelSchema = new mongoose.Schema( 
  {
    place: String,
    name: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    geolocation: {
      latitude: Number,
      longitude: Number,
    },
    main_image: String,
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    ownerEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    ownerPassword: {
      type: String,
    },
    price: {
      type: Number,
      required: true,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
    },
    features: [String],
    hotel_images: [String],
    room_images: [String],
    amenities_images: [String],
    dining_images: [String],
    amenities: {
      general_facilities: [String],
      business_recreation: [String],
      recreation: [String],
      dining: [String],
      business: [String],
    },

    description: String,
    duration: String,
    people: String,
    standard_rooms: [
      {
        description: String,
        features: [String],
        price: Number,
      },
    ],
    deluxe_rooms: [
      {
        description: String,
        features: [String],
        price: Number,
      },
    ],
    suite_rooms: [
      {
        description: String,
        features: [String],
        price: Number,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    nearby_attractions: [// dont give this field // will cause error
      {
        name: String,
        type: String,
        description: String,
        distance: String,
        walking_time: String,
      },
    ],
    airports: [
      {
        name: String,
        travel_time: String,
        distance: String,
        cost: String,
        transport_options: [String],
      },
    ],
    rail: [
      {
        name: String,
        travel_time: String,
        distance: String,
        cost: String,
        transport_options: [String],
      },
    ],
    bus: [
      {
        name: String,
        travel_time: String,
        distance: String,
        cost: String,
        transport_options: [String],
      },
    ],
    ports: [
      {
        name: String,
        travel_time: String,
        distance: String,
        cost: String,
        transport_options: [String],
      },
    ],
    local_transport: [
      {
        name: String,
        distance: String,
        transport_options: [String],
      },
    ],
    contact_info: [
      {
        contact_type: String, // renamed from 'type'
        value: String,
      },
    ],
    reviews: [
      {
        name: String,
        heading: String,
        date: String,
        rating: Number,
        comment: String,
        images: [String],
      },
    ],
    policy: [
      {
        check_in: String,
        check_out: String,
        early_check_in: String,
        late_check_out: String,
        cancellation_policy: [String],
        important_info: [String],
        House_rules: [String],
        payment_info: [String],
      },
    ],
     
  },
  { timestamps: true }
);
// Only if exists
module.exports = mongoose.model("Hotel", hotelSchema);
