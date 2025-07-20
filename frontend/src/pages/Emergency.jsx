import React, { useEffect, useState } from "react";
import hospitalData from "../assets/nearby_hospitals.json";
import policeData from "../assets/nearby_police.json";
import { useAppContext } from "../context/AppContext";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import useLiveLocation from "../hooks/useLiveLocation";
import { getUserIdFromToken } from "../utils/jwtUtils";
import { getWhatsappLinkWithTracking } from "../utils/whatsappUtils";

const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const Emergency = () => {
  const {
    location,
    setLocation,
    address,
    setAddress,
    currentcity,
    setCurrentcity,
    emergencyContacts,
  } = useAppContext();

  // Get user ID from JWT token
  const userId = getUserIdFromToken();
  
  // Live location tracking hook
  const { isTracking, startTracking, stopTracking } = useLiveLocation(userId);

  const [loading, setLoading] = useState(true);
  const [nearbyHospitals, setNearbyHospitals] = useState([]);
  const [nearbyPoliceStations, setNearbyPoliceStations] = useState([]);
  const [locationError, setLocationError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const { t } = useTranslation();

  useEffect(() => {
    const getLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(userCoords, showError, {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        });
      } else {
        setLocationError("Geolocation is not supported by your browser.");
        setLoading(false);
      }
    };
    getLocation();
  }, [retryCount]);

  const userCoords = async (position) => {
    try {
      const userLat = position.coords.latitude;
      const userLng = position.coords.longitude;
      setLocation({ lat: userLat, lng: userLng });
      await getDetails(userLat, userLng);
      getNearbyData(userLat, userLng);
      setLocationError(null);
    } catch (error) {
      setLocationError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const showError = (error) => {
    let errorMessage = "";
    switch (error.code) {
      case error.PERMISSION_DENIED:
        errorMessage = "Location permission denied.";
        break;
      case error.POSITION_UNAVAILABLE:
        errorMessage = "Location information is unavailable.";
        break;
      case error.TIMEOUT:
        errorMessage = "Location request timed out.";
        break;
      default:
        errorMessage = "An unknown error occurred.";
    }
    setLocationError(errorMessage);
    setLoading(false);
  };

  const getDetails = async (lat, long) => {
    try {
      const proxy = "https://api.allorigins.win/get?url=";
      const api = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${long}&format=json`;
      const res = await fetch(proxy + encodeURIComponent(api));
      const result = await res.json();
      if (!result.contents) throw new Error("No address found");
      const data = JSON.parse(result.contents);
      setAddress(data.address);
      setCurrentcity(
        data.address.city || data.address.town || data.address.village || ""
      );
    } catch (error) {
      console.error("Address fetch failed:", error);
      setLocationError("Address fetch failed.");
    }
  };

  const getNearbyData = (lat, lng) => {
    try {
      const hospitals = hospitalData
        .filter((item) => item.Latitude && item.Longitude)
        .map((item) => ({
          ...item,
          distance: haversineDistance(
            lat,
            lng,
            parseFloat(item.Latitude),
            parseFloat(item.Longitude)
          ),
        }))
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 5);

      const police = policeData
        .filter((item) => item.Latitude && item.Longitude)
        .map((item) => ({
          ...item,
          distance: haversineDistance(
            lat,
            lng,
            parseFloat(item.Latitude),
            parseFloat(item.Longitude)
          ),
        }))
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 5);

      setNearbyHospitals(hospitals);
      setNearbyPoliceStations(police);
    } catch (error) {
      console.error("Error processing nearby data:", error);
      setLocationError("Error finding facilities.");
    }
  };

  // Function to handle emergency contact notification with live tracking
  const handleEmergencyContact = async (contactType, phoneNumber) => {
    if (!userId) {
      toast.error("Please log in to use emergency tracking");
      return;
    }

    if (!phoneNumber) {
      toast.error(`Please add ${contactType}'s phone number in settings`);
      return;
    }

    try {
      // Start live location tracking
      const trackingStarted = startTracking();
      
      if (trackingStarted) {
        // Generate WhatsApp link with live tracking
        const whatsappUrl = getWhatsappLinkWithTracking(
          phoneNumber, 
          userId, 
          location?.lat, 
          location?.lng
        );
        
        // Open WhatsApp in new tab
        window.open(whatsappUrl, '_blank');
        
        toast.success(`Live tracking started! WhatsApp opened for ${contactType}`);
      }
    } catch (error) {
      console.error('Error starting emergency tracking:', error);
      toast.error('Failed to start emergency tracking');
    }
  };

  // Legacy function for backward compatibility
  const getWhatsappLink = (phone, lat = location?.lat, lng = location?.lng) => {
    const digitsOnly = phone.replace(/[^0-9]/g, "");
    if (!digitsOnly) return "#";
    const message = `Emergency! I need help at this location: https://maps.google.com/?q=${lat},${lng}`;
    return `https://wa.me/${digitsOnly}?text=${encodeURIComponent(message)}`;
  };

  const formatAddress = () => {
    if (!address) return "Coordinates only available";
    return `${address.city || address.town || address.village || ""}, ${
      address.state || ""
    }, ${address.postcode || ""}`;
  };

  const handleRetry = () => {
    setLoading(true);
    setLocationError(null);
    setRetryCount((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 mt-20 bg-gradient-to-br from-pink-100 to-purple-100">
      <h1 className="text-4xl md:text-5xl font-extrabold text-red-700 mb-4 text-center drop-shadow">
        🚨 Emergency
      </h1>

      {/* Notify Contacts */}
      <div className="bg-yellow-50 p-6 rounded-2xl shadow border border-yellow-200 mb-6 w-full max-w-4xl text-center">
        <h3 className="text-xl font-bold text-yellow-800 mb-4">🧑‍🤝‍🧑 Notify Contacts</h3>
        <div className="flex flex-wrap justify-center gap-4">
          {emergencyContacts && (
            <>
              {emergencyContacts.mom && (
                <button
                  onClick={() => handleEmergencyContact('Mom', emergencyContacts.mom)}
                  className={`px-4 py-2 rounded transition ${
                    isTracking 
                      ? 'bg-red-600 text-white hover:bg-red-700' 
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                  disabled={isTracking}
                >
                  {isTracking ? '🔄 Tracking Active' : '💬 Mom'}
                </button>
              )}
              {emergencyContacts.dad && (
                <button
                  onClick={() => handleEmergencyContact('Dad', emergencyContacts.dad)}
                  className={`px-4 py-2 rounded transition ${
                    isTracking 
                      ? 'bg-red-600 text-white hover:bg-red-700' 
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                  disabled={isTracking}
                >
                  {isTracking ? '🔄 Tracking Active' : '💬 Dad'}
                </button>
              )}
              {emergencyContacts.friend && (
                <button
                  onClick={() => handleEmergencyContact('Best Friend', emergencyContacts.friend)}
                  className={`px-4 py-2 rounded transition ${
                    isTracking 
                      ? 'bg-red-600 text-white hover:bg-red-700' 
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                  disabled={isTracking}
                >
                  {isTracking ? '🔄 Tracking Active' : '💬 Best Friend'}
                </button>
              )}
            </>
          )}
        </div>
        
        {/* Stop Tracking Button */}
        {isTracking && (
          <div className="mt-4">
            <button
              onClick={stopTracking}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
            >
              🛑 Stop Live Tracking
            </button>
          </div>
        )}
      </div>

      {/* Current Location */}
      {loading ? (
        <div className="flex flex-col items-center">
          <div className="text-lg text-gray-700 mb-4">Finding location...</div>
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="w-full max-w-2xl bg-white/80 backdrop-blur p-6 rounded-2xl shadow-2xl text-center space-y-4 border border-gray-200">
          {locationError ? (
            <div className="bg-red-50 border-l-4 border-red-400 text-red-700 p-4 rounded-lg">
              <p className="font-semibold">{locationError}</p>
              <button
                onClick={handleRetry}
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-semibold text-gray-800">📍 Your Current Location</h2>
              <p className="text-xs text-gray-600 mt-1">
                📌 Latitude: {location?.lat?.toFixed(6)}, Longitude: {location?.lng?.toFixed(6)}
              </p>
              <p className="text-gray-600 text-sm md:text-base px-4">{formatAddress()}</p>
              <a
                href={`https://www.google.com/maps?q=${location?.lat},${location?.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow hover:scale-105 transition"
              >
                🌍 Open in Maps
              </a>
            </>
          )}
        </div>
      )}

      {/* Nearest Facilities */}
      {!loading && !locationError && (
        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
          {/* Hospitals */}
          <div className="bg-red-50 p-6 rounded-2xl shadow border border-red-200 space-y-4">
            <h3 className="text-xl font-bold text-red-700 text-center">🏥 Nearest Hospitals</h3>
            {nearbyHospitals.length > 0 ? (
              nearbyHospitals.map((item, index) => (
                <div
                  key={index}
                  className="bg-white/80 backdrop-blur rounded-xl p-4 border hover:shadow-lg transition"
                >
                  <h4 className="text-lg font-semibold">{item["Hospital Name"]}</h4>
                  <p className="text-sm text-gray-600 mt-1">{item.Address}</p>
                  <p className="text-xs text-gray-500 mt-1">{item.distance.toFixed(1)} km away</p>
                  <a
                    href={getWhatsappLink(item["Phone Number"], item.Latitude, item.Longitude)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block bg-green-600 text-white rounded py-1.5 px-4 text-sm hover:bg-green-700 transition"
                  >
                    💬 WhatsApp
                  </a>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500">No hospitals found nearby.</p>
            )}
          </div>

          {/* Police */}
          <div className="bg-blue-50 p-6 rounded-2xl shadow border border-blue-200 space-y-4">
            <h3 className="text-xl font-bold text-blue-700 text-center">🚓 Nearest Police Stations</h3>
            {nearbyPoliceStations.length > 0 ? (
              nearbyPoliceStations.map((item, index) => (
                <div
                  key={index}
                  className="bg-white/80 backdrop-blur rounded-xl p-4 border hover:shadow-lg transition"
                >
                  <h4 className="text-lg font-semibold">
                    {item["Police Station Name"] || "Police Station"}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">{item.Address}</p>
                  <p className="text-xs text-gray-500 mt-1">{item.distance.toFixed(1)} km away</p>
                  <a
                    href={getWhatsappLink(item["Phone Number"], item.Latitude, item.Longitude)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block bg-green-600 text-white rounded py-1.5 px-4 text-sm hover:bg-green-700 transition"
                  >
                    💬 WhatsApp
                  </a>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500">No police stations found nearby.</p>
            )}
          </div>
        </div>
      )}
      
      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 z-50">
        <div id="toast-container"></div>
      </div>
    </div>
  );
};

export default Emergency;
