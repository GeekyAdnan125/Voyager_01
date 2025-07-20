# 🚨 Live Location Sharing System

This document describes the live location sharing system implemented for emergency situations in the Voyager travel app.

## 🎯 Overview

The live location sharing system allows users to share their real-time location with emergency contacts during crisis situations. When a user clicks an emergency contact button, the system:

1. Starts continuous GPS tracking
2. Sends location updates to the backend every 5 seconds
3. Opens WhatsApp with a live tracking link
4. Provides a public tracking page for contacts to monitor location

## 🏗️ Architecture

### Backend (Node.js + Express + MongoDB)
- **Model**: `LiveLocation` - Stores user location data
- **Routes**: `/api/location/:userId` - Location API endpoints
- **Controller**: `locationController.js` - Handles location operations
- **Cleanup**: Auto-deletes old records after 1 hour

### Frontend (React + Vite)
- **Hook**: `useLiveLocation` - Manages GPS tracking
- **Page**: `TrackLocationPage` - Public tracking interface
- **Utils**: JWT decoding and WhatsApp link generation
- **Integration**: Enhanced Emergency page with live tracking

## 📁 File Structure

```
server/
├── models/
│   └── LiveLocation.js          # MongoDB schema
├── controllers/
│   └── locationController.js    # Location API logic
├── routes/
│   └── location.js              # Location routes
├── utils/
│   └── cleanup.js               # Cleanup utilities
└── index.js                     # Main server (updated)

frontend/
├── src/
│   ├── hooks/
│   │   └── useLiveLocation.js   # Live tracking hook
│   ├── utils/
│   │   ├── jwtUtils.js          # JWT token utilities
│   │   └── whatsappUtils.js     # WhatsApp link helpers
│   ├── pages/
│   │   ├── Emergency.jsx        # Enhanced emergency page
│   │   └── TrackLocationPage.jsx # Public tracking page
│   └── App.jsx                  # Main app (updated)
└── package.json                 # Dependencies (updated)
```

## 🚀 API Endpoints

### POST `/api/location/:userId`
Updates user's live location
```json
{
  "latitude": 12.345678,
  "longitude": 98.765432
}
```

### GET `/api/location/:userId`
Retrieves user's latest location
```json
{
  "success": true,
  "data": {
    "userId": "user123",
    "latitude": 12.345678,
    "longitude": 98.765432,
    "updatedAt": "2024-01-01T12:00:00.000Z"
  }
}
```

### GET `/api/location/:userId/status`
Checks if location tracking is active
```json
{
  "success": true,
  "isActive": true,
  "lastUpdated": "2024-01-01T12:00:00.000Z",
  "message": "Location tracking is active"
}
```

### POST `/api/location/cleanup`
Manually triggers cleanup of old records (admin use)

## 🔧 Key Features

### 1. Live GPS Tracking
- Uses `navigator.geolocation.watchPosition`
- Updates every 5 seconds
- High accuracy enabled
- Automatic timeout handling

### 2. WhatsApp Integration
- Generates tracking links with live URL
- Includes static Google Maps fallback
- Formatted emergency messages
- Phone number validation

### 3. Public Tracking Page
- Real-time map with Leaflet
- Auto-refreshes every 5 seconds
- Shows coordinates and timestamps
- Quick links to external maps

### 4. Security & Privacy
- User ID extracted from JWT tokens
- No authentication required for tracking page
- Auto-cleanup after 1 hour
- No sensitive data stored

### 5. Error Handling
- GPS permission handling
- Network error recovery
- Toast notifications
- Graceful fallbacks

## 🛠️ Installation & Setup

### Backend Dependencies
All required dependencies are already included in the existing project.

### Frontend Dependencies
```bash
npm install leaflet
```

### Environment Variables
No additional environment variables required.

## 📱 Usage

### For Users
1. Navigate to Emergency page
2. Click on emergency contact button (Mom/Dad/Friend)
3. Grant location permission when prompted
4. WhatsApp opens with tracking link
5. Contact can monitor location via the link

### For Contacts
1. Receive WhatsApp message with tracking link
2. Click the link to open tracking page
3. View real-time location on map
4. See last updated timestamp
5. Access external map links

## 🔄 Tracking Lifecycle

1. **Start**: User clicks emergency contact button
2. **Active**: GPS tracking runs for up to 1 hour
3. **Update**: Location sent to backend every 5 seconds
4. **Monitor**: Contact views tracking page
5. **Stop**: Automatic after 1 hour or tab closure
6. **Cleanup**: Old records deleted automatically

## 🛡️ Safety Features

- **Time Limit**: Maximum 1 hour tracking
- **Auto-cleanup**: Records deleted after expiry
- **Tab Closure**: Tracking stops when browser closes
- **Error Recovery**: Graceful handling of GPS errors
- **Privacy**: No personal data in tracking URLs

## 🐛 Troubleshooting

### Common Issues

1. **GPS Permission Denied**
   - Check browser location settings
   - Ensure HTTPS in production
   - Clear browser permissions

2. **Tracking Not Starting**
   - Verify user is logged in
   - Check JWT token validity
   - Ensure emergency contacts are set

3. **Map Not Loading**
   - Check internet connection
   - Verify Leaflet installation
   - Clear browser cache

4. **Backend Errors**
   - Check MongoDB connection
   - Verify server is running
   - Check API endpoint URLs

## 🔮 Future Enhancements

- [ ] Add tracking history
- [ ] Implement geofencing alerts
- [ ] Add multiple contact notifications
- [ ] Include emergency type selection
- [ ] Add offline location caching
- [ ] Implement push notifications

## 📞 Support

For technical issues or questions about the live location system, please refer to the main project documentation or contact the development team. 