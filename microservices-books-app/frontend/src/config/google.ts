// Google OAuth Configuration
// To use Google Sign-In:
// 1. Go to https://console.cloud.google.com/
// 2. Create a project (or select existing)
// 3. Enable "Google+ API"
// 4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
// 5. Add authorized JavaScript origins: http://localhost:3000
// 6. Copy the Client ID and paste it below

export const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || '217504511165-ummgfc5v3ci9dosghem9ivdab23fggus.apps.googleusercontent.com';

// Note: For production, set REACT_APP_GOOGLE_CLIENT_ID in your .env file
// Example: REACT_APP_GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
