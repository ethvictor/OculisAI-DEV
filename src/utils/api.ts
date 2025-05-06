
// Detect and configure backend URL
const detectBackendUrl = (): string => {
  // First check if we have an environment variable
  if (import.meta.env.VITE_BACKEND_URL) {
    return import.meta.env.VITE_BACKEND_URL;
  }
  
  // Try to detect if we're accessing from VM or localhost
  const hostname = window.location.hostname;
  
  // If we're on the VM
  if (hostname === '192.168.0.243') {
    return 'http://192.168.0.243:8000';
  }
  
  // Default to localhost
  return 'http://127.0.0.1:8000';
};

export const BACKEND_URL = detectBackendUrl();
