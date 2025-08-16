import { supabase } from '../supabaseClient'
import bcrypt from 'bcryptjs'

// Authentication Service using existing Supabase users table
export const authService = {
  // Sign up - create user in users table, but no Supabase auth account
  async signUp(username, password) {
    try {
      // Check if username already exists in users table
      const { data: existingUser } = await supabase
        .from('users')
        .select('username')
        .eq('username', username)
        .single()

      if (existingUser) {
        return { error: 'Username already exists' }
      }

      // Hash password using bcrypt
      const passwordHash = await this.hashPassword(password)

      // Create new user in users table (no Supabase auth account)
      const { data, error } = await supabase
        .from('users')
        .insert([{
          username: username,
          password_hash: passwordHash,
          created_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) return { error: error.message }

      // Return user data without password
      const { password_hash, ...userData } = data
      return { data: userData, error: null }
    } catch (error) {
      return { error: error.message }
    }
  },

  // Sign in - verify against users table
  async signIn(username, password) {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single()

      if (error || !user) {
        return { error: 'User not found' }
      }

      // Verify password using bcrypt
      const isValidPassword = await this.verifyPassword(password, user.password_hash)
      if (!isValidPassword) {
        return { error: 'Invalid password' }
      }

      // Return user data without password
      const { password_hash, ...userData } = user
      return { data: userData, error: null }
    } catch (error) {
      return { error: error.message }
    }
  },

  // Sign out - just clear local storage
  async signOut() {
    return { error: null }
  },

  // Get current user - from local storage only
  async getCurrentUser() {
    try {
      const userData = localStorage.getItem('user')
      if (userData) {
        return { user: JSON.parse(userData), error: null }
      }
      return { user: null, error: null }
    } catch (error) {
      return { user: null, error: error.message }
    }
  },

  // Get user profile - from users table
  async getUserProfile(userId) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
    return { data, error }
  },

  // Helper function to hash password using bcrypt
  async hashPassword(password) {
    const saltRounds = 10
    return await bcrypt.hash(password, saltRounds)
  },

  // Helper function to verify password using bcrypt
  async verifyPassword(password, hash) {
    return await bcrypt.compare(password, hash)
  }
}

// Easter Eggs Service - saves to Supabase using app's service account
export const easterEggsService = {
  // Get all easter eggs
  async getAllEasterEggs() {
    const { data, error } = await supabase
      .from('easter_eggs')
      .select('*')
      .order('created_at', { ascending: false })
    return { data, error }
  },

  // Get user's easter eggs
  async getUserEasterEggs(userId) {
    const { data, error } = await supabase
      .from('easter_eggs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  // Create easter egg - saves to Supabase with user info
  async createEasterEgg(eggData) {
    const { data, error } = await supabase
      .from('easter_eggs')
      .insert([eggData])
      .select()
    return { data, error }
  },

  // Update easter egg
  async updateEasterEgg(id, updates) {
    const { data, error } = await supabase
      .from('easter_eggs')
      .update(updates)
      .eq('id', id)
      .select()
    return { data, error }
  },

  // Delete easter egg
  async deleteEasterEgg(id) {
    const { error } = await supabase
      .from('easter_eggs')
      .delete()
      .eq('id', id)
    return { error }
  }
}

// Comments Service - saves to Supabase using app's service account
export const commentsService = {
  // Get comments for an easter egg
  async getComments(easterEggId) {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('easter_egg_id', easterEggId)
      .order('created_at', { ascending: true })
    return { data, error }
  },

  // Add comment - saves to Supabase with user info
  async addComment(commentData) {
    const { data, error } = await supabase
      .from('comments')
      .insert([commentData])
      .select()
    return { data, error }
  }
}

// Likes Service - saves to Supabase using app's service account
export const likesService = {
  // Get user likes
  async getUserLikes(userId) {
    try {
      const { data, error } = await supabase
        .from('user_likes')
        .select('easter_egg_id')
        .eq('user_id', userId)
      
      if (error) {
        console.error('Error fetching user likes:', error)
        return { data: [], error }
      }
      
      return { data: data || [], error: null }
    } catch (error) {
      console.error('Error in getUserLikes:', error)
      return { data: [], error: error.message }
    }
  },

  // Toggle like - saves to Supabase
  async toggleLike(userId, easterEggId) {
    try {
      // Check if already liked
      const { data: existingLike, error: checkError } = await supabase
        .from('user_likes')
        .select('*')
        .eq('user_id', userId)
        .eq('easter_egg_id', easterEggId)
        .single()

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking existing like:', checkError)
        return { error: 'Failed to check like status', liked: false }
      }

      if (existingLike) {
        // Unlike
        const { error } = await supabase
          .from('user_likes')
          .delete()
          .eq('user_id', userId)
          .eq('easter_egg_id', easterEggId)
        
        if (error) {
          console.error('Error removing like:', error)
          return { error: 'Failed to remove like', liked: false }
        }
        
        return { error: null, liked: false }
      } else {
        // Like
        const { error } = await supabase
          .from('user_likes')
          .insert([{
            user_id: userId,
            easter_egg_id: easterEggId
          }])
        
        if (error) {
          console.error('Error adding like:', error)
          return { error: 'Failed to add like', liked: false }
        }
        
        return { error: null, liked: true }
      }
    } catch (error) {
      console.error('Error in toggleLike:', error)
      return { error: 'Failed to toggle like', liked: false }
    }
  }
}

// Storage Service - for images/videos (using app's service account)
export const storageService = {
  // Upload file
  async uploadFile(bucket, path, file) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file)
    return { data, error }
  }
} 