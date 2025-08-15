import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Debug logging
console.log("🔧 Supabase Config:")
console.log("URL:", supabaseUrl ? "✅ Set" : "❌ Missing")
console.log("Key:", supabaseAnonKey ? "✅ Set" : "❌ Missing")

let supabase: any

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Missing Supabase environment variables!")
  console.error("Please create a .env.local file with:")
  console.error("NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url")
  console.error("NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key")
  
  // Create a mock client that will fail gracefully
  const mockClient = {
    from: () => ({
      select: () => ({
        order: () => Promise.resolve({ data: [], error: null })
      }),
      insert: () => ({
        select: () => ({
          single: () => Promise.resolve({ data: null, error: new Error("Supabase not configured") })
        })
      }),
      update: () => ({
        eq: () => Promise.resolve({ error: new Error("Supabase not configured") })
      })
    })
  }
  
  supabase = mockClient
} else {
  supabase = createClient(supabaseUrl, supabaseAnonKey)
}

export { supabase } 