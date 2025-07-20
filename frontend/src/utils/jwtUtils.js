// Utility function to decode JWT token and extract user information
export const decodeJWT = (token) => {
  try {
    if (!token) return null;
    
    // JWT tokens have 3 parts separated by dots
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    // Decode the payload (second part)
    const payload = JSON.parse(atob(parts[1]));
    return payload;
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};

// Get user ID from stored JWT token
export const getUserIdFromToken = () => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) return null;
    
    const decoded = decodeJWT(token);
    return decoded?.userId || null;
  } catch (error) {
    console.error('Error getting user ID from token:', error);
    return null;
  }
};

// Get user info from stored JWT token
export const getUserInfoFromToken = () => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) return null;
    
    const decoded = decodeJWT(token);
    return {
      userId: decoded?.userId,
      name: decoded?.name,
      email: decoded?.email,
      role: decoded?.role
    };
  } catch (error) {
    console.error('Error getting user info from token:', error);
    return null;
  }
}; 