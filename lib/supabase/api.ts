import { supabase } from './client'

export interface EasterEgg {
  id: string
  title: string
  description: string
  album?: string
  media_type?: string
  clue_type?: string
  image_url?: string
  video_url?: string
  upvotes_count?: number
  comments_count: number
  created_at: string
  updated_at: string
}

export interface Comment {
  id: string
  easter_egg_id: string
  content: string
  author: string
  created_at: string
}

// Fetch all Easter eggs
export async function fetchEasterEggs(): Promise<EasterEgg[]> {
  try {
    const { data, error } = await supabase
      .from('easter_eggs')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching Easter eggs:', error)
      // Return sample data if Supabase fails
      return getSampleEasterEggs()
    }

    return data || getSampleEasterEggs()
  } catch (error) {
    console.error('Error in fetchEasterEggs:', error)
    // Return sample data if there's any other error
    return getSampleEasterEggs()
  }
}

// Sample data for when Supabase is not configured
function getSampleEasterEggs(): EasterEgg[] {
  return [
    {
      id: '1',
      title: 'Midnight Clock at 3 AM',
      description: 'Taylor Swift\'s album "Midnights" was released at midnight, and she often references 3 AM in her lyrics. The clock striking 3 AM represents the witching hour and the vulnerability that comes with late-night thoughts.',
      album: 'Midnights',
      media_type: 'Album Art',
      clue_type: 'Time',
      image_url: '/midnight-clock-taylor-swift.png',
      upvotes_count: 42,
      comments_count: 8,
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z'
    },
    {
      id: '2',
      title: 'Folklore Cardigan Buttons',
      description: 'The cardigan featured in the "Folklore" album artwork has buttons that spell out "TS" when arranged in a specific pattern. This subtle detail connects to her initials and the album\'s cozy, intimate aesthetic.',
      album: 'folklore',
      media_type: 'Album Art',
      clue_type: 'Visual',
      image_url: '/folklore-cardigan-buttons.png',
      upvotes_count: 38,
      comments_count: 12,
      created_at: '2024-01-14T15:30:00Z',
      updated_at: '2024-01-14T15:30:00Z'
    },
    {
      id: '3',
      title: 'Lover Heart Hands',
      description: 'Throughout the "Lover" era, Taylor used heart-shaped hand gestures in performances and photoshoots. This became a signature symbol representing the album\'s themes of love and romance.',
      album: 'Lover',
      media_type: 'Performance',
      clue_type: 'Symbol',
      image_url: '/diverse-user-avatars.png',
      upvotes_count: 35,
      comments_count: 6,
      created_at: '2024-01-13T12:15:00Z',
      updated_at: '2024-01-13T12:15:00Z'
    }
  ]
}

// Add a new Easter egg
export async function addEasterEgg(egg: Omit<EasterEgg, 'id' | 'created_at' | 'updated_at' | 'upvotes_count' | 'comments_count'>): Promise<EasterEgg | null> {
  const { data, error } = await supabase
    .from('easter_eggs')
    .insert([egg])
    .select()
    .single()

  if (error) {
    console.error('Error adding Easter egg:', error)
    return null
  }

  return data
}

// Update upvote count
export async function updateUpvoteCount(id: string, increment: boolean): Promise<boolean> {
  // First get the current count
  const { data: currentEgg } = await supabase
    .from('easter_eggs')
    .select('upvotes_count')
    .eq('id', id)
    .single()

  if (!currentEgg) return false

  const newCount = increment ? currentEgg.upvotes_count + 1 : Math.max(0, currentEgg.upvotes_count - 1)

  const { error } = await supabase
    .from('easter_eggs')
    .update({ 
      upvotes_count: newCount,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)

  if (error) {
    console.error('Error updating upvote count:', error)
    return false
  }

  return true
}

// Fetch comments for an Easter egg
export async function fetchComments(easterEggId: string): Promise<Comment[]> {
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('easter_egg_id', easterEggId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching comments:', error)
    return []
  }

  return data || []
}

// Add a new comment
export async function addComment(comment: Omit<Comment, 'id' | 'created_at'>): Promise<Comment | null> {
  const { data, error } = await supabase
    .from('comments')
    .insert([comment])
    .select()
    .single()

  if (error) {
    console.error('Error adding comment:', error)
    return null
  }

  // Update the comment count on the Easter egg
  const { data: currentEgg } = await supabase
    .from('easter_eggs')
    .select('comments_count')
    .eq('id', comment.easter_egg_id)
    .single()

  if (currentEgg) {
    await supabase
      .from('easter_eggs')
      .update({ 
        comments_count: currentEgg.comments_count + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', comment.easter_egg_id)
  }

  return data
} 