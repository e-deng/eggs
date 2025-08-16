import { supabase } from '../supabaseClient'

// Authentication
export const authService = {
  // Sign up
  async signUp(email, password, username) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username }
      }
    })
    return { data, error }
  },

  // Sign in
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // Get current user
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  },

  // Get user profile
  async getUserProfile(userId) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
    return { data, error }
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