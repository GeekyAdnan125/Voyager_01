const LiveLocation = require("../models/LiveLocation");

// Update or create location for a user
exports.updateLocation = async (req, res) => {
  try {
    const { userId } = req.params;
    const { latitude, longitude } = req.body;

    // Validate input
    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: "Latitude and longitude are required"
      });
    } 

    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return res.status(400).json({
        success: false,
        message: "Latitude and longitude must be numbers"
      });
    }

    // Validate coordinate ranges
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return res.status(400).json({
        success: false,
        message: "Invalid coordinates"
      });
    }

    // Upsert location data
    const location = await LiveLocation.findOneAndUpdate(
      { userId },
      {
        userId,
        latitude,
        longitude,
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    );

    console.log(`[Location] Updated location for user ${userId}: ${latitude}, ${longitude}`);

    res.json({
      success: true,
      message: "Location updated successfully",
      data: {
        userId: location.userId,
        latitude: location.latitude,
        longitude: location.longitude,
        updatedAt: location.updatedAt
      }
    });

  } catch (error) {
    console.error("[Location] Update error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Get latest location for a user
exports.getLocation = async (req, res) => {
  try {
    const { userId } = req.params;

    const location = await LiveLocation.findOne({ userId })
      .sort({ updatedAt: -1 })
      .select('userId latitude longitude updatedAt');

    if (!location) {
      return res.status(404).json({
        success: false,
        message: "Location not found for this user"
      });
    }

    // Check if location is older than 1 hour (3600000 ms)
    const oneHourAgo = new Date(Date.now() - 3600000);
    if (location.updatedAt < oneHourAgo) {
      return res.status(404).json({
        success: false,
        message: "Location tracking has expired (older than 1 hour)"
      });
    }

    res.json({
      success: true,
      data: {
        userId: location.userId,
        latitude: location.latitude,
        longitude: location.longitude,
        updatedAt: location.updatedAt
      }
    });

  } catch (error) {
    console.error("[Location] Get error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Cleanup old location records (utility function)
exports.cleanupOldLocations = async () => {
  try {
    const oneHourAgo = new Date(Date.now() - 3600000);
    const result = await LiveLocation.deleteMany({
      updatedAt: { $lt: oneHourAgo }
    });

    console.log(`[Location] Cleaned up ${result.deletedCount} old location records`);
    return result.deletedCount;
  } catch (error) {
    console.error("[Location] Cleanup error:", error);
    return 0;
  }
};

// Get location status (for checking if tracking is active)
exports.getLocationStatus = async (req, res) => {
  try {
    const { userId } = req.params;

    const location = await LiveLocation.findOne({ userId })
      .sort({ updatedAt: -1 })
      .select('updatedAt');

    if (!location) {
      return res.json({
        success: true,
        isActive: false,
        message: "No active location tracking"
      });
    }

    // Check if location is older than 1 hour
    const oneHourAgo = new Date(Date.now() - 3600000);
    const isActive = location.updatedAt > oneHourAgo;

    res.json({
      success: true,
      isActive,
      lastUpdated: location.updatedAt,
      message: isActive ? "Location tracking is active" : "Location tracking has expired"
    });

  } catch (error) {
    console.error("[Location] Status error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
}; 