const Hotel = require("../models/HotelSchema");
const bcrypt = require("bcryptjs");
const Room = require("../models/rooms");

exports.createHotel = async (req, res) => {
  try {
    const {
      place,
      name,
      location,
      geolocation,
      main_image,
      ownerEmail,
      ownerPassword,
      price,
      rating,
      features,
      hotel_images,
      room_images,
      amenities_images,
      dining_images,
      amenities,
      description,
      duration,
      people,
      standard_rooms,
      deluxe_rooms,
      suite_rooms,
      isActive,
      nearby_attractions,
      airports,
      rail,
      bus,
      ports,
      local_transport,
      contact_info,
      reviews,
      policy,
    } = req.body;

    // ✅ Sanitize risky field BEFORE usage
    // if (!Array.isArray(nearby_attractions)) {
    //   delete req.body.nearby_attractions;
    // }
    delete req.body.nearby_attractions;

    // Basic required field validation
    if (
      !place ||
      !name ||
      !location ||
      !price ||
      !ownerEmail
      // || !ownerPassword
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: place, name, location, price, ownerEmail, or ownerPassword.",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(ownerPassword, 10);

    // Create hotel document
    const newHotel = await Hotel.create({
      place,
      name,
      location,
      geolocation,
      main_image,
      ownerEmail: ownerEmail.toLowerCase().trim(),
      ownerPassword: hashedPassword,
      price,
      rating,
      features,
      hotel_images,
      room_images,
      amenities_images,
      dining_images,
      amenities,
      description,
      duration,
      people,
      standard_rooms,
      deluxe_rooms,
      suite_rooms,
      isActive: isActive !== undefined ? isActive : true,
      nearby_attractions,
      airports,
      rail,
      bus,
      ports,
      local_transport,
      contact_info,
      reviews,
      policy,
    });

    return res.status(201).json({
      success: true,
      message: "Hotel created successfully",
      hotel: newHotel,
    });
  } catch (error) {
    console.error("Error creating hotel:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

exports.getAllHotels = async (req, res) => {
  try {
    const hotels = await Hotel.find();
    res.status(200).json(hotels);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findByIdAndDelete(req.params.id);
    res.status(200).json(hotel);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createRooms = async (req, res) => {
  try {
    const { number_of_rooms, room_type, hotelId } = req.body;

    // Basic validation
    if (!number_of_rooms || !room_type || !hotelId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Verify the hotel exists
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }

    // Build room documents
    const rooms = Array.from({ length: number_of_rooms }, () => ({
      hotel: hotel.name, // fills the `hotel` string field
      hotelId: hotel._id, // fills the ObjectId ref
      room_type,
    }));

    // Insert into MongoDB
    const createdRooms = await Room.insertMany(rooms);

    res.status(201).json({
      message: `${createdRooms.length} rooms created successfully.`,
      rooms: createdRooms,
    });
  } catch (error) {
    console.error("Error creating rooms:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
exports.getHotelsByEmail = async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({ error: "Email parameter is required" });
    }

    const hotels = await Hotel.find({ ownerEmail: email });

    if (!hotels.length) {
      return res
        .status(404)
        .json({ message: "No hotels found for this email" });
    }

    return res.status(200).json(hotels);
  } catch (error) {
    console.error("Error fetching hotels by email:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getRoomsByHotelId = async (req, res) => {
  const { hotelId } = req.params;

  try {
    if (!hotelId) {
      return res.status(400).json({ message: "Hotel ID is required" });
    }

    const rooms = await Room.find({ hotelId });

    if (rooms.length === 0) {
      return res.status(404).json({ message: "No rooms found for this hotel" });
    }

    res.status(200).json(rooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
