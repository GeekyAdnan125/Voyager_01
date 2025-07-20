const express = require("express");
const {
  updateLocation,
  getLocation,
  getLocationStatus
} = require("../controllers/locationController");
const { manualCleanup } = require("../utils/cleanup");

const locationRoutes = express.Router();

// Update user's live location
locationRoutes.post("/:userId", updateLocation);

// Get user's latest location
locationRoutes.get("/:userId", getLocation);

// Get location tracking status
locationRoutes.get("/:userId/status", getLocationStatus);

// Manual cleanup route (for admin use)
locationRoutes.post("/cleanup", manualCleanup);

module.exports = locationRoutes; 