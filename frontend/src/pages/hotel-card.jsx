"use client"

export function HotelCard({ hotel, onBookNow }) {
  // Add this at the beginning of the component
  console.log("🏨 HotelCard received hotel data:", hotel)

  // Helper function to get all amenities from the API structure
  const getAllAmenities = (amenities) => {
    if (!amenities || typeof amenities !== "object") {
      return [] // Return empty array instead of hardcoded fallback
    }

    const allAmenities = []

    // Extract amenities from different categories
    if (amenities.general_facilities && Array.isArray(amenities.general_facilities)) {
      allAmenities.push(...amenities.general_facilities)
    }

    if (amenities.business_recreation && Array.isArray(amenities.business_recreation)) {
      allAmenities.push(...amenities.business_recreation)
    }

    if (amenities.recreation && Array.isArray(amenities.recreation)) {
      allAmenities.push(...amenities.recreation)
    }

    if (amenities.dining && Array.isArray(amenities.dining)) {
      allAmenities.push(...amenities.dining)
    }

    if (amenities.business && Array.isArray(amenities.business)) {
      allAmenities.push(...amenities.business)
    }

    // Remove duplicates and return
    return [...new Set(allAmenities)].filter(Boolean)
  }

  // Get price range from room types based on transformed data structure
  const getPriceRange = () => {
    // Use transformed roomTypes array instead of raw API structure
    if (hotel.roomTypes && hotel.roomTypes.length > 0) {
      const prices = hotel.roomTypes.map((rt) => rt.price).filter((price) => price && price > 0)

      if (prices.length === 0) {
        const basePrice = hotel.price || 0
        return { min: basePrice, max: basePrice, hasRange: false }
      }

      const min = Math.min(...prices)
      const max = Math.max(...prices)
      return { min, max, hasRange: min !== max }
    }

    // Fallback to base hotel price
    const basePrice = hotel.price || 0
    return { min: basePrice, max: basePrice, hasRange: false }
  }

  // Get availability status based on room types
  const getAvailabilityStatus = () => {
    // Use transformed roomTypes array
    if (hotel.roomTypes && hotel.roomTypes.length > 0) {
      const totalAvailable = hotel.roomTypes.reduce((sum, rt) => sum + (rt.available || 0), 0)
      return {
        available: totalAvailable > 0,
        totalRooms: totalAvailable,
        lowStock: totalAvailable <= 3 && totalAvailable > 0,
      }
    }

    return { available: true, totalRooms: 0 }
  }

  const amenities = getAllAmenities(hotel.amenities)
  const priceInfo = getPriceRange()
  const availability = getAvailabilityStatus()

  console.log("🏨 HotelCard processed data:", { amenities, priceInfo, availability })

  return (
    <div className="border rounded-lg bg-white shadow-sm overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02] border-gray-200 group">
      {/* Image Section */}
      <div className="aspect-video relative overflow-hidden w-full h-48">
        <img
          src={
            hotel.image ||
            hotel.main_image ||
            (hotel.images && hotel.images[0]) ||
            "/placeholder.svg?height=200&width=300&text=Hotel+Image"
          }
          alt={hotel.name || "Unnamed Hotel"}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
          onError={(e) => {
            e.target.src = "/placeholder.svg?height=200&width=300&text=Hotel+Image"
          }}
        />

        {/* Overlay with rating and availability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        {/* Rating Badge */}
        <div className="absolute top-3 right-3">
          <span className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-sm font-medium flex items-center gap-1 shadow-sm">
            ⭐ {hotel.rating ?? "N/A"}
          </span>
        </div>

        {/* Availability Badge */}
        {!availability.available && (
          <div className="absolute top-3 left-3">
            <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">Sold Out</span>
          </div>
        )}

        {availability.lowStock && availability.available && (
          <div className="absolute top-3 left-3">
            <span className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium">
              Only {availability.totalRooms} left
            </span>
          </div>
        )}

        {/* Location overlay */}
        <div className="absolute bottom-3 left-3 text-white">
          <div className="flex items-center text-sm font-medium">
            <span className="mr-1">📍</span>
            {hotel.location || hotel.place || "Location not specified"}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4">
        {/* Hotel Name and Description */}
        <div className="space-y-2 mb-3">
          <h3 className="font-semibold text-lg leading-tight text-gray-800 group-hover:text-blue-600 transition-colors">
            {hotel.name || "Unnamed Hotel"}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
            {hotel.description || "No description available."}
          </p>
        </div>

        {/* Hotel Features/Highlights */}
        {hotel.features && hotel.features.length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-1">
              {hotel.features.slice(0, 2).map((feature, index) => (
                <span
                  key={index}
                  className="text-xs bg-purple-50 text-purple-700 border border-purple-200 px-2 py-1 rounded-full font-medium"
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Amenities */}
        {amenities.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {amenities.slice(0, 3).map((amenity, index) => (
                <span
                  key={index}
                  className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-1 rounded-full font-medium"
                >
                  {amenity}
                </span>
              ))}
              {amenities.length > 3 && (
                <span className="text-xs bg-gray-100 text-gray-600 border border-gray-200 px-2 py-1 rounded-full font-medium">
                  +{amenities.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Room Types Preview */}
        {hotel.roomTypes && hotel.roomTypes.length > 0 && (
          <div className="mb-3">
            <div className="text-xs text-gray-500 mb-1">Available Rooms:</div>
            <div className="flex flex-wrap gap-1">
              {hotel.roomTypes.slice(0, 3).map((roomType, index) => (
                <span
                  key={index}
                  className="text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-1 rounded-full font-medium"
                >
                  {roomType.type} (₹{roomType.price})
                </span>
              ))}
              {hotel.roomTypes.length > 3 && (
                <span className="text-xs bg-gray-100 text-gray-600 border border-gray-200 px-2 py-1 rounded-full font-medium">
                  +{hotel.roomTypes.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer with Price and Book Button */}
      <div className="px-4 pb-4 border-t border-gray-100 pt-3 bg-gray-50/50">
        <div className="flex items-center justify-between">
          {/* Price Section */}
          <div className="flex flex-col">
            {priceInfo.hasRange ? (
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold text-gray-800">₹{(typeof priceInfo.min === "number" ? priceInfo.min : 0).toLocaleString()}</span>
                <span className="text-lg font-bold text-gray-800">- ₹{(typeof priceInfo.max === "number" ? priceInfo.max : 0).toLocaleString()}</span>
              </div>
            ) : (
              <span className="text-lg font-bold text-gray-800">₹{(typeof priceInfo.min === "number" ? priceInfo.min : 0).toLocaleString()}</span>
            )}
            <span className="text-xs text-gray-500">per night</span>
            {priceInfo.hasRange && <span className="text-xs text-blue-600 font-medium">Multiple room types</span>}
          </div>

          {/* Duration and People info */}
          {(hotel.duration || hotel.people) && (
            <div className="text-xs text-gray-500 mt-1">
              {hotel.duration && <span>{hotel.duration}</span>}
              {hotel.duration && hotel.people && <span> • </span>}
              {hotel.people && <span>{hotel.people}</span>}
            </div>
          )}

          {/* Book Button */}
          <button
            onClick={() => {
              console.log("🎯 HotelCard: Book Now clicked for hotel:", {
                id: hotel._id,
                name: hotel.name,
                location: hotel.location || hotel.place,
                available: availability.available,
              })
              onBookNow()
            }}
            disabled={!availability.available}
            className={`px-4 py-2 rounded-md font-medium transition-all duration-200 ${
              availability.available
                ? "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md active:scale-95"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {availability.available ? "Book Now" : "Sold Out"}
          </button>
        </div>

        {/* Additional Info */}
        {availability.available && (
          <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
            <span>{availability.totalRooms} rooms available</span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-400 rounded-full"></span>
              Instant confirmation
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
