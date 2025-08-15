import React, { useState, useMemo, useEffect } from "react"
import { TrendingUp, MessageCircle, Plus, Search, Filter } from "lucide-react"
import AddEggModal from "./components/AddEggModal"

export default function App() {
  const [easterEggs, setEasterEggs] = useState([])
  const [selectedEgg, setSelectedEgg] = useState(null)
  const [isAddEggModalOpen, setIsAddEggModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedAlbum, setSelectedAlbum] = useState("All Albums")
  const [loading, setLoading] = useState(true)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState("")
  const [upvotedEggs, setUpvotedEggs] = useState(new Set())
  const [sortBy, setSortBy] = useState("date")

  // Fetch Easter eggs on component mount - only once
  useEffect(() => {
    console.log("🚀 Initial load - calling loadEasterEggs")
    loadEasterEggs()
  }, []) // Empty dependency array - only run once on mount

  const loadEasterEggs = async () => {
    try {
      setLoading(true)
      console.log("🔍 Loading Easter eggs from API...")
      
      const response = await fetch('/api/easter-eggs')
      if (!response.ok) {
        throw new Error('Failed to fetch Easter eggs')
      }
      
      const eggs = await response.json()
      console.log("✅ Loaded Easter eggs from API:", eggs)
      console.log("📊 API egg count:", eggs.length)
      
      if (eggs.length > 0) {
        console.log("📝 First egg details:", eggs[0])
      }
      
      // Always set the eggs data
      setEasterEggs(eggs)
    } catch (error) {
      console.error("❌ Error loading Easter eggs:", error)
      // Don't set fallback data - just show empty state
      setEasterEggs([])
    } finally {
      setLoading(false)
    }
  }

  const loadComments = async (easterEggId) => {
    try {
      console.log("🔍 Loading comments for egg:", easterEggId)
      const response = await fetch(`/api/easter-eggs/${easterEggId}/comments`)
      if (!response.ok) {
        throw new Error('Failed to fetch comments')
      }
      const comments = await response.json()
      console.log("✅ Loaded comments:", comments)
      setComments(comments)
    } catch (error) {
      console.error("❌ Error loading comments:", error)
    }
  }

  const handleEggClick = async (egg) => {
    setSelectedEgg(egg)
    await loadComments(egg.id)
    setNewComment("")
  }

  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedEgg) return

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          easter_egg_id: selectedEgg.id,
          content: newComment.trim(),
          author: "You"
        })
      })

      if (!response.ok) {
        throw new Error('Failed to add comment')
      }

      const comment = await response.json()

      if (comment) {
        // Add the new comment to the local state
        setComments(prev => [comment, ...prev])
        setNewComment("")

        // Refresh the Easter eggs list to get updated comment counts
        await loadEasterEggs()
        
        // Also refresh the selected egg data
        const updatedEggs = await fetch('/api/easter-eggs').then(res => res.json())
        const updatedEgg = updatedEggs.find(egg => egg.id === selectedEgg.id)
        if (updatedEgg) {
          setSelectedEgg(updatedEgg)
        }
      }
    } catch (error) {
      console.error("Error adding comment:", error)
    }
  }

  const handleVote = async (eggId, action) => {
    try {
      const response = await fetch(`/api/easter-eggs/${eggId}/upvote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action })
      })

      if (!response.ok) {
        throw new Error('Failed to update upvote')
      }

      const result = await response.json()
      
      if (result.success) {
        // Update the local state with new upvote count
        setEasterEggs((prev) => prev.map(egg => 
          egg.id === eggId 
            ? { ...egg, upvotes_count: result.upvotes_count }
            : egg
        ))

        // Also update the selected egg if it's the same one
        setSelectedEgg((prev) => 
          prev && prev.id === eggId 
            ? { ...prev, upvotes_count: result.upvotes_count }
            : prev
        )

        // Track upvoted eggs for visual feedback
        if (action === 'upvote') {
          setUpvotedEggs(prev => new Set([...prev, eggId]))
        }
      }
    } catch (error) {
      console.error("Error updating upvote:", error)
    }
  }

  const handleAddEgg = async (newEgg) => {
    try {
      console.log("🆕 Adding new egg to API:", newEgg.title || "New Egg")
      
      const response = await fetch('/api/easter-eggs', {
        method: 'POST',
        body: newEgg // newEgg is now FormData
      })

      if (!response.ok) {
        throw new Error('Failed to add Easter egg')
      }

      const addedEgg = await response.json()
      
      if (addedEgg) {
        console.log("✅ Egg added to API:", addedEgg)
        // Refresh the eggs list from API to get the latest data
        await loadEasterEggs()
      }
    } catch (error) {
      console.error("❌ Error adding egg:", error)
    }
  }

  // Filter and sort Easter eggs
  const filteredAndSortedEasterEggs = useMemo(() => {
    let filtered = easterEggs.filter((egg) => {
      const matchesSearch =
        egg.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        egg.description?.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesAlbum = selectedAlbum === "All Albums" || egg.album === selectedAlbum

      return matchesSearch && matchesAlbum
    })

    // Sort based on selected criteria
    switch (sortBy) {
      case "upvotes":
        return filtered.sort((a, b) => (b.upvotes_count || 0) - (a.upvotes_count || 0))
      case "comments":
        return filtered.sort((a, b) => (b.comments_count || 0) - (a.comments_count || 0))
      case "date":
      default:
        return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    }
  }, [easterEggs, searchQuery, selectedAlbum, sortBy])

  const albums = ["All Albums", "Taylor Swift", "Fearless", "Speak Now", "Red", "1989", "Reputation", "Lover", "Folklore", "Evermore", "Midnights", "TTPD", "The Life of a Showgirl"]

  // Function to get album-specific colors
  const getAlbumColors = (albumName) => {
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
  const mediaTypes = ["Album Art", "Music Video", "Music", "Performance", "Interview", "Social Media", "Other"]
  const clueTypes = ["Visual", "Color", "Symbol", "Time", "Number", "Lyrics", "Fashion", "Other"]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Easter eggs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-orange-100 to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b-2 border-orange-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                  
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 via-orange-600 to-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">🥚</span>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent">
                  Taylor Swift Easter Eggs
                </h1>
                <p className="text-sm text-gray-600">
                  Discover hidden clues and connections
                </p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setIsAddEggModalOpen(true)}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-2 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Plus className="h-5 w-5 mr-2 inline" />
                Add Easter Egg
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                placeholder="Search Easter eggs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-base border-gray-200 focus:border-purple-500 focus:ring-purple-500 w-full px-3 py-2 border rounded-lg"
              />
            </div>
            
            <div className="flex gap-2">
              <select 
                value={selectedAlbum} 
                onChange={(e) => setSelectedAlbum(e.target.value)}
                className={`w-48 h-12 border rounded-lg px-3 py-2 transition-colors ${
                  selectedAlbum !== "All Albums" && getAlbumColors(selectedAlbum)
                    ? `${getAlbumColors(selectedAlbum).border} ${getAlbumColors(selectedAlbum).bg} ${getAlbumColors(selectedAlbum).text}`
                    : 'border-gray-200'
                }`}
              >
                {albums.map((album) => (
                  <option key={album} value={album}>
                    {album}
                  </option>
                ))}
              </select>
              
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="w-40 h-12 border-gray-200 border rounded-lg px-3 py-2"
              >
                <option value="date">Sort by Date</option>
                <option value="upvotes">Sort by Likes</option>
                <option value="comments">Sort by Comments</option>
              </select>
            </div>
          </div>
        </div>

        {/* Easter Eggs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedEasterEggs.map((egg) => (
            <div
              key={egg.id}
              onClick={() => handleEggClick(egg)}
              className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer overflow-hidden group ${
                egg.album 
                  ? `${getAlbumColors(egg.album).bg} bg-opacity-30 border-2 ${getAlbumColors(egg.album).border}` 
                  : 'border border-gray-100 hover:border-orange-200'
              }`}
            >
              <div className="relative">
                <img
                  src={egg.image_url || "/placeholder.svg"}
                  alt={egg.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                />
                <div className="absolute top-3 right-3 flex gap-2">
                  <button
                    className={`${
                      upvotedEggs.has(egg.id) 
                        ? egg.album 
                          ? `${getAlbumColors(egg.album).bg} ${getAlbumColors(egg.album).text} border-2 ${getAlbumColors(egg.album).border}` 
                          : 'bg-orange-100 text-orange-700 border-orange-200'
                        : 'bg-white/90 hover:bg-white text-gray-700 hover:bg-orange-50 hover:text-orange-700'
                    } shadow-md px-3 py-1 rounded text-sm flex items-center gap-1 transition-colors`}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleVote(egg.id, 'upvote')
                    }}
                  >
                    <TrendingUp className={`h-4 w-4 ${upvotedEggs.has(egg.id) ? (egg.album ? getAlbumColors(egg.album).text : 'text-orange-600') : ''}`} />
                    <span>{egg.upvotes_count || 0}</span>
                  </button>
                  <button
                    className="bg-white/90 hover:bg-white text-gray-700 shadow-md px-3 py-1 rounded text-sm flex items-center gap-1 hover:bg-orange-50 hover:text-orange-700 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation()
                      // Remove upvote functionality
                    }}
                  >
                    <MessageCircle className="h-4 w-4" />
                    {egg.comments_count}
                  </button>
                </div>
              </div>

              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{egg.title}</h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-3">{egg.description}</p>

                {/* Stats row */}
                <div className="flex items-center gap-4 mb-3 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    <span>{egg.upvotes_count || 0} likes</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="h-3 w-3" />
                    <span>{egg.comments_count || 0} comments</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  {egg.album && (
                    <span className={`${getAlbumColors(egg.album).bg} ${getAlbumColors(egg.album).border} ${getAlbumColors(egg.album).text} text-xs px-2 py-1 border rounded`}>
                      {egg.album}
                    </span>
                  )}
                  {egg.media_type && (
                    <span className="border-pink-200 text-pink-700 text-xs px-2 py-1 border rounded">
                      {egg.media_type}
                    </span>
                  )}
                  {egg.clue_type && (
                    <span className="border-yellow-200 text-yellow-700 text-xs px-2 py-1 border rounded">
                      {egg.clue_type}
                    </span>
                  )}
                </div>

                <div className="text-xs text-gray-500">
                  Discovered • {new Date(egg.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredAndSortedEasterEggs.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Easter eggs found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        )}
      </main>

      {/* Detailed Easter egg modal */}
      {selectedEgg && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[95vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{selectedEgg.title}</h2>
              <button 
                onClick={() => setSelectedEgg(null)} 
                className="hover:bg-gray-100 px-2 py-1 rounded"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto max-h-[calc(95vh-120px)]">
              <div className="p-4 sm:p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
                  <div>
                    <img
                      src={selectedEgg.image_url || "/placeholder.svg"}
                      alt={selectedEgg.title}
                      className="w-full h-48 sm:h-64 object-cover rounded-lg"
                    />
                  </div>

                  <div>
                    <p className="text-gray-700 mb-4 text-sm sm:text-base">{selectedEgg.description}</p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {selectedEgg.album && (
                        <span className={`${getAlbumColors(selectedEgg.album).bg} ${getAlbumColors(selectedEgg.album).border} ${getAlbumColors(selectedEgg.album).text} text-xs sm:text-sm px-2 py-1 border rounded`}>
                          {selectedEgg.album}
                        </span>
                      )}
                      {selectedEgg.media_type && (
                        <span className="border-pink-200 text-pink-700 text-xs sm:text-sm px-2 py-1 border rounded">
                          {selectedEgg.media_type}
                        </span>
                      )}
                      {selectedEgg.clue_type && (
                        <span className="border-yellow-200 text-yellow-700 text-xs sm:text-sm px-2 py-1 border rounded">
                          {selectedEgg.clue_type}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 mb-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <button
                          onClick={() => handleVote(selectedEgg.id, 'upvote')}
                          className={`flex items-center gap-2 transition-colors p-2 rounded-lg ${
                            upvotedEggs.has(selectedEgg.id)
                              ? selectedEgg.album
                                ? `${getAlbumColors(selectedEgg.album).bg} ${getAlbumColors(selectedEgg.album).text}`
                                : 'text-orange-700 bg-orange-50'
                              : 'text-gray-600 hover:text-orange-700 hover:bg-orange-50'
                          }`}
                        >
                          <TrendingUp className={`h-4 w-4 ${upvotedEggs.has(selectedEgg.id) ? (selectedEgg.album ? getAlbumColors(selectedEgg.album).text : 'text-orange-600') : ''}`} />
                          <span className="text-sm sm:text-base">{selectedEgg.upvotes_count || 0} likes</span>
                        </button>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <MessageCircle className="h-4 w-4" />
                        <span className="text-sm sm:text-base">{selectedEgg.comments_count} discussions</span>
                      </div>
                    </div>

                    <div className="text-xs sm:text-sm text-gray-500">
                      Discovered • {new Date(selectedEgg.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Comments Section */}
                <div className="border-t pt-4 sm:pt-6">
                  <h3 className="text-lg font-semibold mb-4">Comments ({comments.length})</h3>

                  {/* Add Comment Form */}
                  <div className="mb-6">
                    <div className="flex gap-2">
                      <input
                        placeholder="Share your thoughts on this Easter egg..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <button
                        onClick={handleAddComment}
                        disabled={!newComment.trim()}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                      >
                        Post
                      </button>
                    </div>
                  </div>

                  {/* Comments List */}
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <div key={comment.id} className="bg-gray-50 rounded-lg p-3 sm:p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-white text-sm font-medium">
                              {comment.author[0]?.toUpperCase() || "U"}
                            </div>
                            <div>
                              <div className="font-medium text-sm">
                                {comment.author}
                              </div>
                              <div className="text-xs text-gray-500">
                                {new Date(comment.created_at).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-700 text-sm">{comment.content}</p>
                      </div>
                    ))}

                    {comments.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p className="text-sm">No comments yet. Be the first to share your thoughts!</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add New Egg Modal */}
      <AddEggModal
        isOpen={isAddEggModalOpen}
        onClose={() => setIsAddEggModalOpen(false)}
        onAdd={handleAddEgg}
      />
    </div>
  )
} 