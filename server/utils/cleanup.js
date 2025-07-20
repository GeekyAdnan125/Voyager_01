const LiveLocation = require("../models/LiveLocation");

// Cleanup old location records (older than 1 hour)
const cleanupOldLocations = async () => {
  try {
    const oneHourAgo = new Date(Date.now() - 3600000);
    const result = await LiveLocation.deleteMany({
      updatedAt: { $lt: oneHourAgo }
    });

    console.log(`[Cleanup] Removed ${result.deletedCount} old location records`);
    return result.deletedCount;
  } catch (error) {
    console.error('[Cleanup] Error cleaning up old locations:', error);
    return 0;
  }
};

// Run cleanup every 30 minutes
const startCleanupScheduler = () => {
  console.log('[Cleanup] Starting cleanup scheduler...');
  
  // Run initial cleanup
  cleanupOldLocations();
  
  // Schedule cleanup every 30 minutes
  setInterval(cleanupOldLocations, 30 * 60 * 1000);
};

// Manual cleanup function (can be called from API)
const manualCleanup = async (req, res) => {
  try {
    const deletedCount = await cleanupOldLocations();
    
    res.json({
      success: true,
      message: `Cleaned up ${deletedCount} old location records`,
      deletedCount
    });
  } catch (error) {
    console.error('[Cleanup] Manual cleanup error:', error);
    res.status(500).json({
      success: false,
      message: 'Cleanup failed',
      error: error.message
    });
  }
};

module.exports = {
  cleanupOldLocations,
  startCleanupScheduler,
  manualCleanup
}; 