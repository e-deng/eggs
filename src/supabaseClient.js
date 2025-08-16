import { createClient } from '@supabase/supabase-js'
import { SUPABASE_CONFIG, isProduction, hasValidSupabaseConfig } from './config'

// Supabase Configuration
// For Create React App, environment variables must be prefixed with REACT_APP_
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || SUPABASE_CONFIG.url
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || SUPABASE_CONFIG.anonKey

// Validate configuration
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables:')
  console.error('   REACT_APP_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing')
  console.error('   REACT_APP_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Set' : 'Missing')
  console.error('   Please check your .env file or environment configuration')
  
  if (isProduction && !hasValidSupabaseConfig) {
    console.error('🚨 PRODUCTION DEPLOYMENT: You need to manually update src/config.js with your Supabase credentials')
    console.error('   Or set environment variables in Cloudflare Pages dashboard')
  }
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Debug logging
console.log('🔍 Supabase URL:', supabaseUrl ? 'Set' : 'Missing')
console.log('🔍 Supabase Key:', supabaseAnonKey ? 'Set' : 'Missing')
console.log('🔍 Environment:', isProduction ? 'Production' : 'Development') 