import { supabase } from '../supabaseClient'

// Simple Local Authentication Service (No database access for users)
export const authService = {
  // Sign up - store user data locally only
  async signUp(username, password) {
    try {
      // Check if username already exists in local storage
      const existingUsers = JSON.parse(localStorage.getItem('users') || '[]')
      if (existingUsers.find(u => u.username === username)) {
        return { error: 'Username already exists' }
      }

      // Create new user (stored locally only)
      const newUser = {
        id: Date.now().toString(), // Simple ID generation
        username: username,
        password_hash: btoa(password), // Simple encoding
        created_at: new Date().toISOString()
      }

      // Add to local storage
      existingUsers.push(newUser)
      localStorage.setItem('users', JSON.stringify(existingUsers))

      // Return user data without password
      const { password_hash, ...userData } = newUser
      return { data: userData, error: null }
    } catch (error) {
      return { error: error.message }
    }
  },

  // Sign in - verify against local storage only
  async signIn(username, password) {
    try {
      const users = JSON.parse(localStorage.getItem('users') || '[]')
      const user = users.find(u => u.username === username)

      if (!user) {
        return { error: 'User not found' }
      }

      // Simple password check
      if (btoa(password) !== user.password_hash) {
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

  // Get user profile - from local storage
  async getUserProfile(userId) {
    try {
      const users = JSON.parse(localStorage.getItem('users') || '[]')
      const user = users.find(u => u.id === userId)
      if (user) {
        const { password_hash, ...userData } = user
        return { data: userData, error: null }
      }
      return { data: null, error: 'User not found' }
    } catch (error) {
      return { data: null, error: error.message }
    }
  }
}

// Easter Eggs
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

  // Create easter egg
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

// Comments
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

  // Add comment
  async addComment(commentData) {
    const { data, error } = await supabase
      .from('comments')
      .insert([commentData])
      .select()
    return { data, error }
  }
}

// Likes
export const likesService = {
  // Get user likes
  async getUserLikes(userId) {
    const { data, error } = await supabase
      .from('user_likes')
      .select('easter_egg_id')
      .eq('user_id', userId)
    return { data, error }
  },

  // Toggle like
  async toggleLike(userId, easterEggId) {
    // Check if already liked
    const { data: existingLike } = await supabase
      .from('user_likes')
      .select('*')
      .eq('user_id', userId)
      .eq('easter_egg_id', easterEggId)
      .single()

    if (existingLike) {
      // Unlike
      const { error } = await supabase
        .from('user_likes')
        .delete()
        .eq('user_id', userId)
        .eq('easter_egg_id', easterEggId)
      return { error, liked: false }
    } else {
      // Like
      const { error } = await supabase
        .from('user_likes')
        .insert([{
          user_id: userId,
          easter_egg_id: easterEggId
        }])
      return { error, liked: true }
    }
  }
}

// Storage (for images/videos)
export const storageService = {
  // Upload file
  async uploadFile(bucket, path, file) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file)
    return { data, error }
  },

  // Get public URL
  getPublicUrl(bucket, path) {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path)
    return data.publicUrl
  },

  // Delete file
  async deleteFile(bucket, path) {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path])
    return { error }
  }
} 