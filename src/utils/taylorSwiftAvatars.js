// Taylor Swift themed avatar generator
// Creates consistent but random avatars for each user based on their ID

const taylorSwiftEmojis = [
  // Hearts in different colors
  '❤️', '💖', '💝', '💕', '💗', '💓', '💞', '💟', '💘', '💙', '💚', '💛', '🧡', '🖤', '🤍', '🤎', '❤️‍🔥',
  
  // Music and instruments
  '🎸', '🎤', '🎵', '🎶', '🎼', '🎹', '🎻',
  
  // Time and clocks
  '🕛',
  '⏰', '⌚', '🕰️',
  
  // Stars and sparkles
  '⭐', '🌟', '✨', '💫', '⚡',
  
  // Nature and elements
  '🌙', '☀️', '🌈', '☁️', '🌧️', '❄️', '🌸', '🌺', '🌹', '🌻',
  
  // Fashion and accessories
  '👑', '💎', '💍', '👠', '👜', '🕶️',
  
  // Animals
  '🦋', '🐍', '🦅', '🦉', '🦊', '🐺',
  
  // Numbers (for album references)
  '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟',
  
  // Special symbols
  '💋', '🔥', '💧', '🌊', '🏰', '🚗', '✈️', '🌍'
]

const taylorSwiftColors = [
  // Album-inspired color combinations
  { bg: 'from-red-400 to-pink-400', border: 'border-red-300' },      // Red
  { bg: 'from-blue-400 to-purple-400', border: 'border-blue-300' },  // 1989
  { bg: 'from-purple-400 to-pink-400', border: 'border-purple-300' }, // Speak Now
  { bg: 'from-yellow-400 to-orange-400', border: 'border-yellow-300' }, // Fearless
  { bg: 'from-green-400 to-teal-400', border: 'border-green-300' },   // Taylor Swift
  { bg: 'from-gray-800 to-black', border: 'border-gray-700' },        // Reputation
  { bg: 'from-pink-400 to-rose-400', border: 'border-pink-300' },     // Lover
  { bg: 'from-gray-400 to-slate-400', border: 'border-gray-300' },    // Folklore
  { bg: 'from-amber-400 to-yellow-400', border: 'border-amber-300' }, // Evermore
  { bg: 'from-blue-800 to-indigo-800', border: 'border-blue-700' },   // Midnights
  { bg: 'from-white to-gray-100', border: 'border-gray-200' },        // TTPD
  { bg: 'from-orange-400 to-red-400', border: 'border-orange-300' }   // The Life of a Showgirl
]

// Generate a consistent avatar for a user based on their ID
export function generateTaylorSwiftAvatar(userId) {
  if (!userId) return getDefaultAvatar()
  
  // Use the user ID to generate consistent but random values
  const hash = simpleHash(userId)
  
  // Pick emoji and colors based on hash
  const emoji = taylorSwiftEmojis[hash % taylorSwiftEmojis.length]
  const colors = taylorSwiftColors[hash % taylorSwiftColors.length]
  
  return {
    emoji,
    colors,
    hash
  }
}

// Simple hash function to convert string to number
function simpleHash(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash)
}

// Default avatar fallback - use random Taylor Swift theme instead of egg
function getDefaultAvatar() {
  return {
    emoji: '💘',
    colors: { bg: 'from-red-400 to-pink-400', border: 'border-red-300' },
    hash: 0
  }
}

// Get CSS classes for the avatar
export function getAvatarClasses(avatar) {
  return `bg-gradient-to-br ${avatar.colors.bg} ${avatar.colors.border} border-2 rounded-full flex items-center justify-center text-white font-bold shadow-lg aspect-square`
} 