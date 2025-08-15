"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "../src/components/ui/button"
import { Input } from "../src/components/ui/input"
import { Badge } from "../src/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../src/components/ui/select"
import { TrendingUp, MessageCircle, Plus, Search, Filter } from "lucide-react"
import AddEggModal from "../src/components/add-egg-modal"
import { fetchEasterEggs, fetchComments, addComment, updateUpvoteCount, addEasterEgg, type EasterEgg, type Comment } from "../lib/supabase/api"

export default function HomePage() {
  const [easterEggs, setEasterEggs] = useState<EasterEgg[]>([])
  const [selectedEgg, setSelectedEgg] = useState<EasterEgg | null>(null)
  const [isAddEggModalOpen, setIsAddEggModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedAlbum, setSelectedAlbum] = useState("All Albums")
  const [loading, setLoading] = useState(true)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")

  // Fetch Easter eggs on component mount - only once
  useEffect(() => {
    console.log("🚀 Initial load - calling loadEasterEggs")
    loadEasterEggs()
  }, []) // Empty dependency array - only run once on mount

  const loadEasterEggs = async () => {
    try {
      setLoading(true)
      console.log("🔍 Loading Easter eggs from Supabase...")
      
      const eggs = await fetchEasterEggs()
      console.log("✅ Loaded Easter eggs from Supabase:", eggs)
      console.log("📊 Supabase egg count:", eggs.length)
      
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

  const loadComments = async (easterEggId: string) => {
    try {
      console.log("🔍 Loading comments for egg:", easterEggId)
      const comments = await fetchComments(easterEggId)
      console.log("✅ Loaded comments:", comments)
      setComments(comments)
    } catch (error) {
      console.error("❌ Error loading comments:", error)
    }
  }

  const handleEggClick = async (egg: EasterEgg) => {
    setSelectedEgg(egg)
    await loadComments(egg.id)
    setNewComment("")
  }

  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedEgg) return

    try {
      const comment = await addComment({
        easter_egg_id: selectedEgg.id,
        content: newComment.trim(),
        author: "You"
      })

      if (comment) {
        // Add the new comment to the local state
        setComments(prev => [comment, ...prev])
        setNewComment("")

        // Update the egg's comment count in local state
        setEasterEggs((prev: EasterEgg[]) => prev.map(egg => 
          egg.id === selectedEgg.id 
            ? { ...egg, comments_count: egg.comments_count + 1 }
            : egg
        ))

        // Update the selected egg's comment count
        setSelectedEgg((prev: EasterEgg | null) => prev ? { ...prev, comments_count: prev.comments_count + 1 } : null)
      }
    } catch (error) {
      console.error("Error adding comment:", error)
    }
  }

  const handleVote = async (eggId: string, increment: boolean) => {
    // Remove upvote functionality
    return
  }

  const handleAddEgg = async (newEgg: any) => {
    try {
      console.log("🆕 Adding new egg to Supabase:", newEgg.title)
      
      // Call the Supabase API to add the egg
      const addedEgg = await addEasterEgg(newEgg)
      
      if (addedEgg) {
        console.log("✅ Egg added to Supabase:", addedEgg)
        // Refresh the eggs list from Supabase to get the latest data
        await loadEasterEggs()
      }
    } catch (error) {
      console.error("❌ Error adding egg:", error)
    }
  }

  // Filter and sort Easter eggs
  const filteredAndSortedEasterEggs = useMemo(() => {
    return easterEggs
      .filter((egg) => {
        const matchesSearch =
          egg.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          egg.description?.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesAlbum = selectedAlbum === "All Albums" || egg.album === selectedAlbum

        return matchesSearch && matchesAlbum
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }, [easterEggs, searchQuery, selectedAlbum])

  const albums = ["All Albums", "folklore", "Midnights", "reputation", "Lover", "1989", "Red", "Speak Now", "Fearless", "Taylor Swift"]
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Supabase Configuration Notice */}
          {!process.env.NEXT_PUBLIC_SUPABASE_URL && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Supabase is not configured. Create a <code className="bg-yellow-100 px-1 rounded">.env.local</code> file with your Supabase credentials to enable full functionality. 
                Currently showing sample data.
              </p>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">🥚</span>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Taylor Swift Easter Eggs
                </h1>
                <p className="text-sm text-gray-600">Discover hidden clues and connections</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={() => setIsAddEggModalOpen(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-2 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Easter Egg
              </Button>
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
              <Input
                placeholder="Search Easter eggs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-base border-gray-200 focus:border-purple-500 focus:ring-purple-500"
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={selectedAlbum} onValueChange={setSelectedAlbum}>
                <SelectTrigger className="w-48 h-12 border-gray-200">
                  <SelectValue placeholder="Filter by album" />
                </SelectTrigger>
                <SelectContent>
                  {albums.map((album) => (
                    <SelectItem key={album} value={album}>
                      {album}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Easter Eggs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedEasterEggs.map((egg) => (
            <div
              key={egg.id}
              onClick={() => handleEggClick(egg)}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer overflow-hidden border border-gray-100 hover:border-purple-200 group"
            >
              <div className="relative">
                <img
                  src={egg.image_url || "/placeholder.svg"}
                  alt={egg.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                />
                <div className="absolute top-3 right-3 flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="bg-white/90 hover:bg-white text-gray-700 shadow-md"
                    onClick={(e) => {
                      e.stopPropagation()
                      // Remove upvote functionality
                    }}
                  >
                    <MessageCircle className="h-4 w-4 mr-1" />
                    {egg.comments_count}
                  </Button>
                </div>
              </div>

              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{egg.title}</h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-3">{egg.description}</p>

                <div className="flex flex-wrap gap-2 mb-3">
                  {egg.album && (
                    <Badge variant="outline" className="border-purple-200 text-purple-700 text-xs">
                      {egg.album}
                    </Badge>
                  )}
                  {egg.media_type && (
                    <Badge variant="outline" className="border-pink-200 text-pink-700 text-xs">
                      {egg.media_type}
                    </Badge>
                  )}
                  {egg.clue_type && (
                    <Badge variant="outline" className="border-yellow-200 text-yellow-700 text-xs">
                      {egg.clue_type}
                    </Badge>
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
              <Button variant="ghost" size="sm" onClick={() => setSelectedEgg(null)} className="hover:bg-gray-100">
                ✕
              </Button>
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
                        <Badge variant="outline" className="border-purple-200 text-purple-700 text-xs sm:text-sm">
                          {selectedEgg.album}
                        </Badge>
                      )}
                      {selectedEgg.media_type && (
                        <Badge variant="outline" className="border-pink-200 text-pink-700 text-xs sm:text-sm">
                          {selectedEgg.media_type}
                        </Badge>
                      )}
                      {selectedEgg.clue_type && (
                        <Badge variant="outline" className="border-yellow-200 text-yellow-700 text-xs sm:text-sm">
                          {selectedEgg.clue_type}
                        </Badge>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 mb-4">
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
                      <Input
                        placeholder="Share your thoughts on this Easter egg..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                        className="flex-1"
                      />
                      <Button
                        onClick={handleAddComment}
                        disabled={!newComment.trim()}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      >
                        Post
                      </Button>
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
