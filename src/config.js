// Configuration file for the application
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000'

// Supabase Configuration
// These can be overridden by environment variables during build
// For production deployment, you can manually update these values
export const SUPABASE_CONFIG = {
  url: process.env.REACT_APP_SUPABASE_URL || 'YOUR_SUPABASE_URL_HERE',
  anonKey: process.env.REACT_APP_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY_HERE'
}

// Check if we're in production and using placeholder values
export const isProduction = process.env.NODE_ENV === 'production'
export const hasValidSupabaseConfig = SUPABASE_CONFIG.url !== 'YOUR_SUPABASE_URL_HERE' && 
                                    SUPABASE_CONFIG.anonKey !== 'YOUR_SUPABASE_ANON_KEY_HERE' 