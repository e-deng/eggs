import { createClient } from '@supabase/supabase-js'

// For Cloudflare Pages, we need to handle environment variables differently
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 
                   (typeof window !== 'undefined' && window.__SUPABASE_URL__) ||
                   'https://your-project-id.supabase.co'

const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 
                       (typeof window !== 'undefined' && window.__SUPABASE_ANON_KEY__) ||
                       'your-anon-key-here'

// Debug logging
console.log('🔍 Supabase URL:', supabaseUrl ? 'Set' : 'Missing')
console.log('🔍 Supabase Key:', supabaseAnonKey ? 'Set' : 'Missing')

export const supabase = createClient(supabaseUrl, supabaseAnonKey) 