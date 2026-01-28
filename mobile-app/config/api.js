// API Configuration
// Update this URL to match your backend server

// For local development:
// - Use your computer's local IP when testing on physical device
// - Use localhost or 10.0.2.2 for Android emulator
// - Use localhost for iOS simulator

const DEV_API_URL = 'http://192.168.0.101:5000/api';
const PROD_API_URL = 'https://your-production-api.com/api';

export const API_URL = __DEV__ ? DEV_API_URL : PROD_API_URL;

export const API_ENDPOINTS = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout', 
  PROFILE: '/auth/me',
  
};

export default API_URL;
