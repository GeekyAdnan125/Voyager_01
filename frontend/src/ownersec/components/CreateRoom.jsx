"use client";
import { useState, useEffect } from "react";
import { useAppContext } from "../../context/AppContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { X, Bed, Plus, Building2, Hash, ChevronDown } from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";



// Enhanced Select component with better styling
const StyledSelect = ({
  value,
  onValueChange,
  children,
  className,
  placeholder,
  error,
}) => {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        className={`
          appearance-none w-full px-4 py-3 pr-10 text-gray-900 bg-white border-2 rounded-xl
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          transition-all duration-200 ease-in-out
          ${
            error
              ? "border-red-400 focus:ring-red-500 focus:border-red-500"
              : "border-gray-200 hover:border-gray-300"
          }
          ${className}
        `}
      >
        <option value="" disabled className="text-gray-500">
          {placeholder}
        </option>
        {children}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
    </div>
  );
};

export default function CreateRoom({ onClose }) {
    const { user } = useAppContext();
    const token = user?.token;
    const userEmail = user?.email;

  // Required useState variables as specified
  const [numberOfRooms, setNumberOfRooms] = useState("");
  const [roomType, setRoomType] = useState("");
  const [hotelId, setHotelId] = useState("");
  const [hotelName, setHotelName] = useState("");

  // Additional state for form handling
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [availableHotels, setAvailableHotels] = useState([]);

  useEffect(() => {
    const fetchHotels = async () => {
      if (user?.email) {
        try {
          const hotelMap = await getHotelsByEmail(user.email);
          console.log("Hotel Map:", hotelMap);

          const hotelNames = Object.keys(hotelMap);
          if (hotelNames.length > 0) {
            setHotelName(hotelNames[0]);
            setHotelId(hotelMap[hotelNames[0]]);
            setAvailableHotels(
              hotelNames.map((name) => ({
                name,
                id: hotelMap[name],
              }))
            );
          } else {
            toast.warn("No hotels found for this user.");
          }
        } catch (error) {
          toast.error("Error loading hotels.");
        }
      }
    };

    fetchHotels();
  }, [user?.email, token]);

  // Move this function ABOVE useEffect
  const getHotelsByEmail = async (email) => {
    try {
      const headers = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(
        `http://localhost:5000/api/owner/hotel/by-email/${encodeURIComponent(
          email
        )}`,
        {
          method: "GET",
          headers,
        }
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const hotels = await response.json();

      const hotelMap = {};
      hotels.forEach((hotel) => {
        hotelMap[hotel.name] = hotel._id;
      });

      return hotelMap;
    } catch (error) {
      console.error("Failed to fetch hotels:", error);
      return {};
    }
  };

  // Validation function
  const validateForm = () => {
    const newErrors = {};

    if (!numberOfRooms || Number.parseInt(numberOfRooms) <= 0) {
      newErrors.numberOfRooms = "Please enter a valid number of rooms";
    }

    if (!roomType) {
      newErrors.roomType = "Please select a room type";
    }

    if (!hotelId) {
      newErrors.hotelId = "Please select a hotel";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fill all required fields correctly");
      return;
    }

    setIsSubmitting(true);

    try {
      const roomData = {
        number_of_rooms: Number.parseInt(numberOfRooms),
        room_type: roomType,
        hotelId: hotelId,
      };

      console.log("Creating rooms with data:", roomData);

      const response = await axios.post(
        "http://localhost:5000/api/owner/hotel/rooms/bulkCreate",
        roomData,
        {
          withCredentials: true,
        }
      );

      console.log("Room creation response:", response.data);

      toast.success(
        `Successfully created ${numberOfRooms} ${roomType} room(s) for ${hotelName}`
      );

      // Reset form
      setNumberOfRooms("");
      setRoomType("");
      setErrors({});

      // Close modal after short delay
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error("Error creating rooms:", error);

      let errorMessage = "Failed to create rooms";

      if (error.response) {
        const { status, data } = error.response;

        switch (status) {
          case 400:
            errorMessage = data?.message || "Invalid room data provided";
            break;
          case 401:
            errorMessage = "Authentication failed. Please log in again.";
            break;
          case 403:
            errorMessage =
              "Access denied. You don't have permission to create rooms.";
            break;
          case 404:
            errorMessage = "Hotel not found. Please select a valid hotel.";
            break;
          case 500:
            errorMessage = "Server error. Please try again later.";
            break;
          default:
            errorMessage =
              data?.message || `Request failed with status ${status}`;
        }
      } else if (error.request) {
        errorMessage = "Network error. Please check your connection.";
      }

      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Full white background - no transparency */}
      <div className="absolute inset-0 bg-white"></div>

      {/* Modal Content */}
      <div className="relative w-full max-w-lg mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Bed className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Add Rooms</h2>
                  <p className="text-blue-100 text-sm">
                    Create new rooms for your hotel
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-10 w-10 p-0 text-white hover:bg-white/20 rounded-full"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Hotel Information Card now using email*/}
              {/* Hotel Selector Dropdown */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-gray-600" />
                  <Label
                    htmlFor="hotelSelect"
                    className="text-lg font-semibold text-gray-800"
                  >
                    Select Hotel*
                  </Label>
                </div>
                <StyledSelect
                  value={hotelId}
                  onValueChange={(selectedId) => {
                    setHotelId(selectedId);
                    const selectedHotel = availableHotels.find(
                      (h) => h.id === selectedId
                    );
                    setHotelName(selectedHotel?.name || "");
                  }}
                  error={errors.hotelId}
                  placeholder="Choose a hotel"
                >
                  {availableHotels.map((hotel) => (
                    <option key={hotel.id} value={hotel.id}>
                      🏨 {hotel.name}
                    </option>
                  ))}
                </StyledSelect>
                {errors.hotelId && (
                  <p className="text-red-500 text-sm flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                    {errors.hotelId}
                  </p>
                )}
              </div>

              {availableHotels.length === 0 && (
                <p className="text-sm text-orange-500 font-medium mt-2">
                  No hotels found for this user.
                </p>
              )}

              {/* Number of Rooms Input */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-gray-600" />
                  <Label
                    htmlFor="numberOfRooms"
                    className="text-lg font-semibold text-gray-800"
                  >
                    Number of Rooms*
                  </Label>
                </div>
                <Input
                  id="numberOfRooms"
                  type="number"
                  min="1"
                  max="100"
                  value={numberOfRooms}
                  onChange={(e) => setNumberOfRooms(e.target.value)}
                  placeholder="Enter number of rooms (e.g., 5)"
                  className={`
                    h-12 px-4 text-lg border-2 rounded-xl transition-all duration-200
                    focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                    ${
                      errors.numberOfRooms
                        ? "border-red-400 focus:ring-red-500 focus:border-red-500"
                        : "border-gray-200 hover:border-gray-300"
                    }
                  `}
                />
                {errors.numberOfRooms && (
                  <p className="text-red-500 text-sm flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                    {errors.numberOfRooms}
                  </p>
                )}
              </div>

              {/* Room Type Dropdown */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Bed className="w-4 h-4 text-gray-600" />
                  <Label
                    htmlFor="roomType"
                    className="text-lg font-semibold text-gray-800"
                  >
                    Room Type*
                  </Label>
                </div>
                <StyledSelect
                  value={roomType}
                  onValueChange={setRoomType}
                  error={errors.roomType}
                  placeholder="Select room type"
                >
                  <option value="standard">🏨 Standard Room</option>
                  <option value="deluxe">✨ Deluxe Room</option>
                  <option value="suite">👑 Suite Room</option>
                </StyledSelect>
                {errors.roomType && (
                  <p className="text-red-500 text-sm flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                    {errors.roomType}
                  </p>
                )}
              </div>

              {/* Summary Card */}
              {numberOfRooms && roomType && hotelName && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <p className="text-lg font-bold text-blue-900">Summary</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <p className="text-gray-800 text-lg">
                      Creating{" "}
                      <span className="font-bold text-blue-600">
                        {numberOfRooms}
                      </span>{" "}
                      <span className="font-bold text-blue-600">
                        {roomType}
                      </span>{" "}
                      room(s)
                    </p>
                    <p className="text-gray-600 mt-1">
                      for <span className="font-semibold">{hotelName}</span>
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 h-12 text-lg font-semibold border-2 border-gray-300 hover:bg-gray-50 rounded-xl transition-all duration-200 bg-transparent"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 h-12 text-lg font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5 mr-2" />
                      Create Rooms
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
