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
  }
}

// Comments Service - saves to Supabase using app's service account
export const commentsService = {
  // Get comments for an easter egg with nested replies
  async getComments(easterEggId, currentUserId = null) {
    try {
      // First get all comments for this easter egg
      const { data: allComments, error } = await supabase
        .from('comments')
        .select('*')
        .eq('easter_egg_id', easterEggId)
        .order('created_at', { ascending: false }) // Newest comments first
      
      if (error) {
        return { data: null, error }
      }
      
      // Handle case where no comments exist
      if (!allComments || allComments.length === 0) {
        return { data: [], error: null }
      }
      
      // Get user's comment likes if user is logged in
      let userCommentLikes = []
      if (currentUserId) {
        try {
          const { commentLikesService } = await import('./supabaseService.js')
          const { data: likes } = await commentLikesService.getUserCommentLikes(currentUserId)
          userCommentLikes = likes || []
        } catch (error) {
          // Error fetching user comment likes
        }
      }
      
      // Organize comments into a tree structure
      const commentsMap = new Map()
      const rootComments = []
      

      
      // First pass: create a map of all comments
      allComments.forEach(comment => {
        const isLikedByUser = userCommentLikes.some(like => like.comment_id === comment.id)
        
        // Check if this is a reply based on content prefix
        let tempParentId = comment.temp_parent_id
        if (!tempParentId && comment.content && comment.content.startsWith('[REPLY_TO:')) {
          const match = comment.content.match(/\[REPLY_TO:([^\]]+)\]/)
          if (match) {
            tempParentId = match[1]
          }
        }
        
        commentsMap.set(comment.id, {
          ...comment,
          replies: [],
          upvotes_count: comment.upvotes_count || 0,
          parent_comment_id: comment.parent_comment_id || null,
          temp_parent_id: tempParentId,
          user: { username: comment.username, profile_picture: null },
          user_likes: isLikedByUser ? [{ user_id: currentUserId }] : []
        })
      })
      
      // Fetch real-time upvote counts from comment_likes table
      // This gives us accurate counts even without the upvotes_count column
      for (const comment of allComments) {
        try {
          // Import the service dynamically to avoid circular dependencies
          const { commentLikesService } = await import('./supabaseService.js')
          const realUpvoteCount = await commentLikesService.getCommentUpvoteCount(comment.id)
          const commentInMap = commentsMap.get(comment.id)
          if (commentInMap) {
            commentInMap.upvotes_count = realUpvoteCount
          }
        } catch (error) {
          // Error fetching upvote count for comment
        }
      }
      
      // Second pass: organize into tree structure
      allComments.forEach(comment => {
        // Check for both the real parent_comment_id and our temporary temp_parent_id
        let parentId = comment.parent_comment_id || comment.temp_parent_id
        
        // Also check if this is a reply based on content prefix
        if (!parentId && comment.content && comment.content.startsWith('[REPLY_TO:')) {
          const match = comment.content.match(/\[REPLY_TO:([^\]]+)\]/)
          if (match) {
            parentId = match[1]

          }
        }
        
        if (parentId && parentId !== null) {
          // This is a reply
          const parentComment = commentsMap.get(parentId)
          if (parentComment) {
            parentComment.replies.push(commentsMap.get(comment.id))

          } else {
            // Parent comment not found, treat as root comment

            rootComments.push(commentsMap.get(comment.id))
          }
        } else {
          // This is a root comment

          rootComments.push(commentsMap.get(comment.id))
        }
      })
      

      
      // Calculate depth for each comment and its replies
      const calculateDepth = (comment, depth = 0) => {
        comment.depth = depth
        if (comment.replies && comment.replies.length > 0) {
          comment.replies.forEach(reply => calculateDepth(reply, depth + 1))
        }
      }
      
      // Apply depth calculation to all root comments
      rootComments.forEach(comment => calculateDepth(comment))
      
      // Sort replies by newest first within each comment
      rootComments.forEach(comment => {
        if (comment.replies && comment.replies.length > 0) {
          comment.replies.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        }
      })
      

      return { data: rootComments, error: null }
    } catch (error) {
      return { data: null, error: error.message }
    }
  },

  // Add comment - saves to Supabase with user info
  async addComment(commentData) {
    try {
      const { error } = await supabase
        .from('comments')
        .insert([commentData])
      
      if (error) {
        return { data: null, error }
      }
      
      // Return the comment data with a generated id for immediate use
      // The actual id will be fetched when we reload comments
      return { 
        data: {
          ...commentData,
          id: `temp-${Date.now()}`,
          created_at: new Date().toISOString(),
          replies: [],
          user: { username: commentData.username, profile_picture: null }
        }, 
        error: null 
      }
    } catch (error) {
      return { data: null, error: error.message }
    }
  },

    // Add reply to a comment
  async addReply(parentCommentId, replyData) {
    try {
      // Since parent_comment_id column doesn't exist yet, we'll use a different approach
      // We'll add a special prefix to the content to identify replies

      
      // Get the parent comment to include its username in the reply
      const { error: parentError } = await supabase
        .from('comments')
        .select('username')
        .eq('id', parentCommentId)
        .single()
      
      if (parentError) {
        return { data: null, error: 'Parent comment not found' }
      }
      
      // Create reply content with a special prefix
      const replyContent = `[REPLY_TO:${parentCommentId}] ${replyData.content}`
      
      const replyDataWithPrefix = {
        ...replyData,
        content: replyContent
      }
      
      const { error } = await supabase
        .from('comments')
        .insert([replyDataWithPrefix])
      
      if (error) {
        return { data: null, error }
      }
      
      return { 
        data: {
          ...replyDataWithPrefix,
          id: `temp-${Date.now()}`,
          created_at: new Date().toISOString(),
          replies: [],
          temp_parent_id: parentCommentId, // Add temp field for frontend use
          user: { username: replyData.username, profile_picture: null }
        }, 
        error: null 
      }
    } catch (error) {
      return { data: null, error: error.message }
    }
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
        return { data: [], error }
      }
      
      return { data: data || [], error: null }
    } catch (error) {
      return { data: [], error: error.message }
    }
  },

  // Toggle like - saves to Supabase
  async toggleLike(userId, easterEggId) {
    try {
      // Check if already liked using count instead of select to avoid query conflicts
      const { count, error: checkError } = await supabase
        .from('user_likes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('easter_egg_id', easterEggId)

      if (checkError) {
        return { error: 'Failed to check like status', liked: false }
      }

      const alreadyLiked = count > 0

      if (alreadyLiked) {
        // Unlike
        const { error } = await supabase
          .from('user_likes')
          .delete()
          .eq('user_id', userId)
          .eq('easter_egg_id', easterEggId)
        
        if (error) {
          return { error: 'Failed to remove like', liked: false }
        }
        
        // Update the likes count in easter_eggs table
        await this.updateEasterEggLikesCount(easterEggId, -1)
        
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
          return { error: 'Failed to add like', liked: false }
        }
        
        // Update the likes count in easter_eggs table
        await this.updateEasterEggLikesCount(easterEggId, 1)
        
        return { error: null, liked: true }
      }
    } catch (error) {
      return { error: 'Failed to toggle like', liked: false }
    }
  },

  // Update the likes count in easter_eggs table
  async updateEasterEggLikesCount(easterEggId, increment) {
    try {
      // First get the current upvotes count
      const { data: currentEgg, error: fetchError } = await supabase
        .from('easter_eggs')
        .select('upvotes_count')
        .eq('id', easterEggId)
        .single()
      
      if (fetchError) {
        return
      }
      
      const currentCount = currentEgg?.upvotes_count || 0
      const newCount = Math.max(0, currentCount + increment) // Ensure count doesn't go below 0
      
      // Update the upvotes count
      const { error: updateError } = await supabase
        .from('easter_eggs')
        .update({ upvotes_count: newCount })
        .eq('id', easterEggId)
      
      if (updateError) {
        // Error updating upvotes count
      }
    } catch (error) {
      // Error in updateEasterEggLikesCount
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

// Comment Likes Service - handles comment upvotes
export const commentLikesService = {
  // Get user's comment likes
  async getUserCommentLikes(userId) {
    try {
      const { data, error } = await supabase
        .from('comment_likes')
        .select('comment_id')
        .eq('user_id', userId)
      
      if (error) {
        return { data: [], error }
      }
      
      return { data: data || [], error: null }
    } catch (error) {
      return { data: [], error: error.message }
    }
  },

  // Get actual upvote count for a comment from comment_likes table
  async getCommentUpvoteCount(commentId) {
    try {
      const { count, error } = await supabase
        .from('comment_likes')
        .select('*', { count: 'exact', head: true })
        .eq('comment_id', commentId)
      
      if (error) {
        return 0
      }
      
      return count || 0
    } catch (error) {
      return 0
    }
  },

  // Toggle comment like
  async toggleCommentLike(userId, commentId) {
    try {
      // Check if already liked
      const { count, error: checkError } = await supabase
        .from('comment_likes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('comment_id', commentId)

      if (checkError) {
        return { error: 'Failed to check like status', liked: false }
      }

      const alreadyLiked = count > 0

      if (alreadyLiked) {
        // Unlike
        const { error } = await supabase
          .from('comment_likes')
          .delete()
          .eq('user_id', userId)
          .eq('comment_id', commentId)
        
        if (error) {
          return { error: 'Failed to remove like', liked: false }
        }
        
        // Update the upvotes count in comments table
        await this.updateCommentUpvotesCount(commentId, -1)
        
        return { error: null, liked: false }
      } else {
        // Like
        const { error } = await supabase
          .from('comment_likes')
          .insert([{
            user_id: userId,
            comment_id: commentId
          }])
        
        if (error) {
          return { error: error.message }
        }
        
        // Update the upvotes count in comments table
        await this.updateCommentUpvotesCount(commentId, 1)
        
        return { error: null, liked: true }
      }
    } catch (error) {
      return { error: 'Failed to toggle like', liked: false }
    }
  },

  // Update the upvotes count in comments table
  async updateCommentUpvotesCount(commentId, increment) {
    // For now, we'll skip updating the upvotes_count column since it doesn't exist yet
    // The real-time count will be fetched from comment_likes table instead
    return
  }

} 