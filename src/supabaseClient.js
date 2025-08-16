import { createClient } from '@supabase/supabase-js'
import { SUPABASE_CONFIG, isProduction, hasValidSupabaseConfig } from './config'

// Supabase Configuration
// For Create React App, environment variables must be prefixed with REACT_APP_
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || SUPABASE_CONFIG.url
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || SUPABASE_CONFIG.anonKey

// Validate configuration
if (!supabaseUrl || !supabaseAnonKey) {
  if (isProduction && !hasValidSupabaseConfig) {
    console.error('Production deployment issue: Missing Supabase configuration')
  }
  
  // Don't create client with invalid values
  throw new Error('Cannot create Supabase client: Missing required configuration')
}

// Validate URL format
try {
  new URL(supabaseUrl)
} catch (error) {
  if (isProduction) {
    console.error('Production deployment issue: Invalid Supabase URL')
  }
  
  throw new Error(`Invalid Supabase URL: ${supabaseUrl}`)
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey) 