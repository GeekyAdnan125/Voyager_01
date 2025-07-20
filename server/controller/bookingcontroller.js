const Booking = require("../models/bookingschema");
const Hotel = require("../models/HotelSchema");
const Room = require("../models/rooms"); // Make sure the path is correct

const createBookingEntry = async ({
  hoteldetails,
  persons,
  user,
  room_id,
  room_type,
  hotel_name,
  check_in_date,
  check_out_date,
  booking_id, // shared for all
}) => {
  const booking_date = new Date();
  const checkIn = new Date(check_in_date);
  const checkOut = new Date(check_out_date);
  const expires = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

  const room = await Room.findById(room_id);
  if (!room) throw new Error("Room not found");

  // Check if room is available
  const isAvailable = !room.bookingDetails.some((b) => {
    const existingStart = new Date(b.check_in);
    const existingEnd = new Date(b.check_out);
    return checkIn < existingEnd && checkOut > existingStart;
  });

  if (!isAvailable) throw new Error("Room already booked for these dates");

  const newBooking = new Booking({
    hoteldetails,
    persons,
    user_Name: user.name,
    user_email: user.email,
    user_phone: user.phone,
    room_id,
    room_type,
    hotel_name,
    booking_id,
    booking_date,
    check_in_date: checkIn,
    check_out_date: checkOut,
    booking_status: "Confirmed",
  });

  await newBooking.save();

  // Update room with new booking details
  room.bookingDetails.push({
    userName: user.name,
    userEmail: user.email,
    userPhone: user.phone,
    check_in: checkIn,
    check_out: checkOut,
    expires,
    new: true,
  });

  await room.save();

  return newBooking;
};

const createBooking = async (req, res) => {
  try {
    const {
      hoteldetails,
      persons,
      room_id,
      room_type,
      hotel_name,
      check_in_date,
      check_out_date,
    } = req.body;

    // Validate required fields
    if (!room_id || !check_in_date || !check_out_date) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing",
      });
    }

    const booking_id = "BK_" + Date.now();
    const booking_date = new Date();
    const checkIn = new Date(check_in_date);
    const checkOut = new Date(check_out_date);

    // Validate dates
    if (checkIn >= checkOut) {
      return res.status(400).json({
        success: false,
        message: "Check-out date must be after check-in date",
      });
    }

    const expires = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

    // Find room and check availability
    const room = await Room.findById(room_id);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    const isAvailable = !room.bookingDetails.some((b) => {
      const existingStart = new Date(b.check_in);
      const existingEnd = new Date(b.check_out);
      return checkIn < existingEnd && checkOut > existingStart;
    });

    if (!isAvailable) {
      return res.status(400).json({
        success: false,
        message: "Room is already booked for these dates",
      });
    }

    // Create new booking
    const newBooking = new Booking({
      user_Name: req.user.name,
      hoteldetails,
      persons,
      user_email: req.user.email,
      user_phone: req.user.phone,
      room_id,
      room_type,
      hotel_name,
      booking_id,
      check_in_date: checkIn,
      check_out_date: checkOut,
      booking_date,
      booking_status: "Confirmed",
    });

    await newBooking.save();

    // Update room booking status
    room.bookingDetails = room.bookingDetails.map((entry) => ({
      ...entry,
      new: false,
    }));

    room.bookingDetails.push({
      userName: req.user.name,
      userEmail: req.user.email,
      userPhone: req.user.phone,
      check_in: checkIn,
      check_out: checkOut,
      expires,
      new: true,
    });

    await room.save();

    res.status(201).json({
      success: true,
      message: "Booking confirmed and room updated",
      data: newBooking,
    });
  } catch (error) {
    console.error("Booking error:", error); // Log the error for debugging
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

const cancelBooking = async (req, res) => {
  try {
    const { booking_id } = req.params; // assuming cancel via URL param

    // Find the booking
    const booking = await Booking.findOne({ booking_id });
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (booking.booking_status === "Cancelled") {
      return res.status(400).json({
        success: false,
        message: "Booking is already cancelled",
      });
    }

    // Update booking status
    booking.booking_status = "Cancelled";
    await booking.save();

    // Remove the dates from the room’s bookingDetails
    const room = await Room.findById(booking.room_id);
    if (room) {
      room.bookingDetails = room.bookingDetails.filter((b) => {
        // remove matching booking in the room’s booking details
        return !(
          b.userEmail === booking.user_email &&
          new Date(b.check_in).getTime() ===
            new Date(booking.check_in_date).getTime() &&
          new Date(b.check_out).getTime() ===
            new Date(booking.check_out_date).getTime()
        );
      });
      await room.save();
    }

    res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      data: booking,
    });
  } catch (error) {
    console.error("Cancel booking error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

const getMyBookings = async (req, res) => {
  try {
    // use email from req.user (you get this from token)
    const userEmail = req.user.email;

    const bookings = await Booking.find({ user_email: userEmail }).sort({
      booking_date: -1,
    });

    res.status(200).json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    console.error("Get my bookings error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

const getAvailableHotels = async (req, res) => {
  try {
    const { room_type, check_in_date, check_out_date, num_rooms } = req.body;

    // Validate input
    if (!room_type || !check_in_date || !check_out_date || !num_rooms) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const checkIn = new Date(check_in_date);
    const checkOut = new Date(check_out_date);

    if (checkIn >= checkOut) {
      return res.status(400).json({
        success: false,
        message: "Check-out date must be after check-in date",
      });
    }

    // Step 1: Get all rooms matching the room_type
    const rooms = await Room.find({ room_type }).lean();

    // Step 2: Group available rooms by hotelId
    const hotelRoomMap = new Map();

    rooms.forEach((room) => {
      const bookings = room.bookingDetails || []; // Fix: prevent crash

      const isAvailable = !bookings.some((b) => {
        const existingStart = new Date(b.check_in);
        const existingEnd = new Date(b.check_out);
        return checkIn < existingEnd && checkOut > existingStart;
      });

      if (isAvailable) {
        const key = room.hotelId.toString();
        if (!hotelRoomMap.has(key)) {
          hotelRoomMap.set(key, {
            hotelId: key,
            count: 1,
          });
        } else {
          hotelRoomMap.get(key).count += 1;
        }
      }
    });

    // Step 3: Fetch hotel details for those with enough available rooms
    const eligibleHotels = [];

    for (const [hotelId, { count }] of hotelRoomMap.entries()) {
      if (count >= num_rooms) {
        try {
          const hotel = await Hotel.findById(hotelId).select("name");
          if (hotel) {
            eligibleHotels.push({
              hotelId: hotel._id,
              hotelName: hotel.name,
            });
          }
        } catch (err) {
          console.warn(`Hotel fetch failed for ID: ${hotelId}`, err.message);
        }
      }
    }

    return res.status(200).json({
      success: true,
      availableHotels: eligibleHotels,
    });
  } catch (error) {
    console.error("Error checking hotel availability:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const bookMultipleRoomsIfAvailable = async (req, res) => {
  try {
    const {
      hotel_name,
      check_in_date,
      check_out_date,
      room_type,
      num_rooms,
      persons,
    } = req.body;

    if (
      !hotel_name ||
      !check_in_date ||
      !check_out_date ||
      !room_type ||
      !num_rooms
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const checkIn = new Date(check_in_date);
    const checkOut = new Date(check_out_date);

    if (checkIn >= checkOut) {
      return res.status(400).json({
        success: false,
        message: "Check-out date must be after check-in date",
      });
    }

    // Step 1: Resolve hotel
    const hotel = await Hotel.findOne({ name: hotel_name });
    if (!hotel) {
      return res
        .status(404)
        .json({ success: false, message: "Hotel not found" });
    }

    // Step 2: Find all matching rooms
    const allRooms = await Room.find({ hotelId: hotel._id, room_type });

    // Step 3: Filter available rooms
    const availableRooms = allRooms.filter((room) => {
      return !room.bookingDetails.some((b) => {
        const existingStart = new Date(b.check_in);
        const existingEnd = new Date(b.check_out);
        return checkIn < existingEnd && checkOut > existingStart;
      });
    });

    if (availableRooms.length < num_rooms) {
      return res.status(400).json({
        success: false,
        message: `Only ${availableRooms.length} room(s) available, but ${num_rooms} requested.`,
      });
    }

    // Step 4: Generate shared booking ID
    const booking_id = "BK_" + Date.now();

    // Step 5: Create bookings
    const bookedRooms = [];

    for (let i = 0; i < num_rooms; i++) {
      const room = availableRooms[i];

      const booking = await createBookingEntry({
        hoteldetails: hotel._id,
        persons,
        user: req.user,
        room_id: room._id,
        room_type,
        hotel_name,
        check_in_date,
        check_out_date,
        booking_id,
      });

      bookedRooms.push(booking);
    }

    return res.status(201).json({
      success: true,
      message: `${num_rooms} room(s) booked at ${hotel_name}`,
      booking_id,
      bookings: bookedRooms,
    });
  } catch (error) {
    console.error("Bulk booking error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

module.exports = {
  createBookingEntry,
  createBooking,
  cancelBooking,
  getMyBookings,
  getAvailableHotels,
  bookMultipleRoomsIfAvailable,
};
