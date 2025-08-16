import { createClient } from '@supabase/supabase-js'

// Supabase Configuration
// For Create React App, environment variables must be prefixed with REACT_APP_
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

// Validate configuration
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables:')
  console.error('   REACT_APP_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing')
  console.error('   REACT_APP_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Set' : 'Missing')
  console.error('   Please check your .env file or environment configuration')
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Debug logging
console.log('🔍 Supabase URL:', supabaseUrl ? 'Set' : 'Missing')
console.log('🔍 Supabase Key:', supabaseAnonKey ? 'Set' : 'Missing') 