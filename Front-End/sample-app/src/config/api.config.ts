// ============================================
// CẤU HÌNH API URL
// ============================================
// Thay đổi PRODUCTION_URL thành IP/domain server của bạn
// Ví dụ: 'http://192.168.1.100:8080' hoặc 'https://api.rentcare.com'

export const API_CONFIG = {
  // URL cho production (khi build APK)
  PRODUCTION_URL: 'https://car-rental-production-8324.up.railway.app',
  
  // URL cho development
  DEV_ANDROID_URL: 'http://10.0.2.2:8080',
  DEV_IOS_URL: 'http://localhost:8080',
};

// Hàm lấy base URL tự động
export const getApiBaseUrl = (): string => {
  if (__DEV__) {
    // Development mode
    const { Platform } = require('react-native');
    return Platform.OS === 'android' 
      ? API_CONFIG.DEV_ANDROID_URL 
      : API_CONFIG.DEV_IOS_URL;
  }
  // Production mode
  return API_CONFIG.PRODUCTION_URL;
};

export const API_BASE_URL = getApiBaseUrl();
