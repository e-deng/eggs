// Function to get album-specific colors
export const getAlbumColors = (albumName) => {
  switch (albumName) {
    case "Taylor Swift":
      return { bg: "bg-green-100", border: "border-green-200", text: "text-green-700" }
    case "Fearless":
      return { bg: "bg-yellow-100", border: "border-yellow-200", text: "text-yellow-700" }
    case "Speak Now":
      return { bg: "bg-purple-100", border: "border-purple-200", text: "text-purple-700" }
    case "Red":
      return { bg: "bg-red-100", border: "border-red-200", text: "text-red-700" }
    case "1989":
      return { bg: "bg-blue-100", border: "border-blue-200", text: "text-blue-700" }
    case "Reputation":
      return { bg: "bg-gray-900", border: "border-gray-800", text: "text-white" }
    case "Lover":
      return { bg: "bg-pink-100", border: "border-pink-200", text: "text-pink-700" }
    case "Folklore":
      return { bg: "bg-gray-100", border: "border-gray-200", text: "text-gray-700" }
    case "Evermore":
      return { bg: "bg-amber-100", border: "border-amber-200", text: "text-amber-700" }
    case "Midnights":
      return { bg: "bg-blue-900", border: "border-blue-800", text: "text-white" }
    case "TTPD":
      return { bg: "bg-white", border: "border-gray-200", text: "text-gray-900" }
    case "The Life of a Showgirl":
      return { bg: "bg-orange-100", border: "border-orange-200", text: "text-orange-700" }
    default:
      return { bg: "bg-gray-100", border: "border-gray-200", text: "text-gray-700" }
  }
}

// Album list for filters
export const albums = ["All Albums", "Taylor Swift", "Fearless", "Speak Now", "Red", "1989", "Reputation", "Lover", "Folklore", "Evermore", "Midnights", "TTPD", "The Life of a Showgirl"]

// Media types for filters
export const mediaTypes = ["Album Art", "Music Video", "Music", "Performance", "Interview", "Social Media", "Other"]

// Clue types for filters
export const clueTypes = ["Visual", "Color", "Symbol", "Time", "Number", "Lyrics", "Fashion", "Other"] 