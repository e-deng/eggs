import { createClient } from '@supabase/supabase-js'
import { SUPABASE_CONFIG, isProduction, hasValidSupabaseConfig } from './config'

// Supabase Configuration
// For Create React App, environment variables must be prefixed with REACT_APP_
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || SUPABASE_CONFIG.url
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || SUPABASE_CONFIG.anonKey

// Enhanced debugging
console.log('🔍 Environment Variables Check:')
console.log('   process.env.REACT_APP_SUPABASE_URL:', process.env.REACT_APP_SUPABASE_URL)
console.log('   process.env.REACT_APP_SUPABASE_ANON_KEY:', process.env.REACT_APP_SUPABASE_ANON_KEY ? 'Set' : 'Missing')
console.log('   SUPABASE_CONFIG.url:', SUPABASE_CONFIG.url)
console.log('   SUPABASE_CONFIG.anonKey:', SUPABASE_CONFIG.anonKey ? 'Set' : 'Missing')
console.log('   Final supabaseUrl:', supabaseUrl)
console.log('   Final supabaseAnonKey:', supabaseAnonKey ? 'Set' : 'Missing')

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
  
  // Don't create client with invalid values
  throw new Error('Cannot create Supabase client: Missing required configuration')
}

// Validate URL format
try {
  new URL(supabaseUrl)
} catch (error) {
  console.error('❌ Invalid Supabase URL format:', supabaseUrl)
  console.error('   Error:', error.message)
  throw new Error(`Invalid Supabase URL: ${supabaseUrl}`)
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Success logging
console.log('✅ Supabase client created successfully')
console.log('🔍 Environment:', isProduction ? 'Production' : 'Development') 