import React, { useState, useEffect, useCallback, useMemo } from "react"
import Header from "./components/Header"
import EasterEggsGrid from "./components/EasterEggsGrid"
import EasterEggModal from "./components/EasterEggModal"
import AddEggModal from "./components/AddEggModal"
import EditEggModal from "./components/EditEggModal"
import AuthModal from "./components/AuthModal"
import AuthNotice from "./components/AuthNotice"
import LoginPrompt from "./components/LoginPrompt"
import NoPostsMessage from "./components/NoPostsMessage"
import TopNavigation from "./components/TopNavigation"
import BottomNavigation from "./components/BottomNavigation"
import Footer from "./components/Footer"
import MobileUserProfile from "./components/MobileUserProfile"
import { easterEggsService, commentsService, likesService } from "./services/supabaseService"
import { authService } from "./services/supabaseService"
import { getAlbumColors } from "./utils/albumColors"
import { supabase } from "./supabaseClient"

export default function App() {
  const [easterEggs, setEasterEggs] = useState([])
  const [selectedEgg, setSelectedEgg] = useState(null)
  const [isAddEggModalOpen, setIsAddEggModalOpen] = useState(false)
  const [isEditEggModalOpen, setIsEditEggModalOpen] = useState(false)

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState("login")
  const [editingEgg, setEditingEgg] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedAlbum, setSelectedAlbum] = useState("All Albums")
  const [loading, setLoading] = useState(true)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState("")
  const [sortBy, setSortBy] = useState("date")
  const [user, setUser] = useState(null)
  const [userLikes, setUserLikes] = useState(new Set())
  const [activeTab, setActiveTab] = useState("home")
  const [isMobileProfileOpen, setIsMobileProfileOpen] = useState(false)

  // Check if user is authenticated on app load
  const checkAuthStatus = useCallback(async () => {
    try {
      const { user, error } = await authService.getCurrentUser()
      
      if (user && !error) {
        setUser(user)
        // We'll call loadUserLikes after it's defined
      } else {
        // No valid session, clear storage
        localStorage.removeItem("user")
        setUser(null)
      }
    } catch (error) {
      console.error("Auth check failed:", error)
      localStorage.removeItem("user")
      setUser(null)
    }
  }, [])

  // Load user's likes
  const loadUserLikes = useCallback(async () => {
    if (!user) return
    
    try {
      const { data, error } = await likesService.getUserLikes(user.id)
      
      if (!error && data) {
        const likedEggIds = data.map(like => like.easter_egg_id)
        setUserLikes(new Set(likedEggIds))
      }
    } catch (error) {
      console.error("Failed to load user likes:", error)
    }
  }, [user])

  // Fetch Easter eggs on component mount - only once
  useEffect(() => {
    loadEasterEggs()
  }, [])

  // Check auth status on mount
  useEffect(() => {
    checkAuthStatus()
  }, [checkAuthStatus])

  // Load user likes when user changes
  useEffect(() => {
    if (user) {
      loadUserLikes()
    }
  }, [user, loadUserLikes])

  // Load Easter eggs from Supabase
  const loadEasterEggs = async () => {
    try {
      const { data: eggs, error } = await easterEggsService.getAllEasterEggs()
      
      if (error) {
        throw new Error('Failed to fetch Easter eggs')
      }
      
      setEasterEggs(eggs || [])
    } catch (error) {
      console.error("Error loading Easter eggs:", error)
      setEasterEggs([])
    } finally {
      setLoading(false)
    }
  }

  // Handle Easter egg click
  const handleEggClick = async (egg) => {
    setSelectedEgg(egg)
    await loadComments(egg.id)
  }

  // Load comments for an Easter egg
  const loadComments = async (easterEggId) => {
    try {
      const { data: comments, error } = await commentsService.getComments(easterEggId)
      
      if (error) {
        throw new Error('Failed to fetch comments')
      }
      
      setComments(comments || [])
    } catch (error) {
      console.error("Error loading comments:", error)
    }
  }

  // Handle adding a comment
  const handleAddComment = async () => {
    if (!user) {
      setIsAuthModalOpen(true)
      setAuthMode("login")
      return
    }

    if (!newComment.trim() || !selectedEgg) return

    try {
      const { data: comment, error } = await commentsService.addComment({
        easter_egg_id: selectedEgg.id,
        user_id: user.id,
        username: user.username, // Add username to the comment
        content: newComment.trim()
      })

      if (error) {
        throw new Error("Failed to add comment")
      }

      setComments(prev => [...prev, comment])
      setNewComment("")

      // Refresh comments to get the real data from the database
      await loadComments(selectedEgg.id)

      // Refresh the Easter eggs list to update comment count
      await loadEasterEggs()
      
      // Also refresh the selected egg
      const updatedEgg = easterEggs.find(egg => egg.id === selectedEgg.id)
      if (updatedEgg) {
        setSelectedEgg(updatedEgg)
      }
    } catch (error) {
      console.error("Error adding comment:", error)
    }
  }

  // Handle voting (like/unlike)
  const handleVote = async (eggId, action) => {
    if (!user) {
      setIsAuthModalOpen(true)
      setAuthMode("login")
      return
    }

    try {
      const { error, liked } = await likesService.toggleLike(user.id, eggId)
      
      if (error) {
        throw new Error('Failed to update like')
      }

      // Update user likes
      if (liked) {
        setUserLikes(prev => new Set([...prev, eggId]))
      } else {
        setUserLikes(prev => {
          const newSet = new Set(prev)
          newSet.delete(eggId)
          return newSet
        })
      }

      // Refresh the Easter eggs list to get updated counts
      await loadEasterEggs()
    } catch (error) {
      console.error("Error updating like:", error)
    }
  }

  // Handle tab switching
  const handleTabChange = (tab) => {
    setActiveTab(tab)
    // Reset any modal states when switching tabs
    setSelectedEgg(null)
    setComments([])
    setNewComment("")
    
    // Clear search and filters when leaving search tab
    if (tab !== 'search') {
      setSearchQuery("")
      setSelectedAlbum("All Albums")
    }
  }

  // Handle editing an Easter egg
  const handleEditEgg = (egg) => {
    setEditingEgg(egg)
    setIsEditEggModalOpen(true)
  }

  // Handle updating an Easter egg
  const handleUpdateEgg = async (eggId, updatedData) => {
    try {
      const { error } = await easterEggsService.updateEasterEgg(eggId, updatedData)
      
      if (error) {
        throw new Error('Failed to update Easter egg')
      }

      // Refresh the Easter eggs list
      loadEasterEggs()
    } catch (error) {
      console.error('Error updating egg:', error)
      throw error
    }
  }

  // Handle adding a new Easter egg
  const handleAddEgg = async (newEgg) => {
    if (!user) {
      setIsAuthModalOpen(true)
      setAuthMode("login")
      return
    }

    try {
      // Convert FormData to regular object for Supabase
      const eggData = {
        title: newEgg.get('title'),
        description: newEgg.get('description'),
        album: newEgg.get('album'),
        media_type: newEgg.get('media_type'),
        clue_type: newEgg.get('clue_type'),
        user_id: user.id,
        username: user.username // Add username to the egg data
      }

      const { data: addedEgg, error } = await easterEggsService.createEasterEgg(eggData)
      
      if (error) {
        throw new Error('Failed to add Easter egg')
      }
      
      if (addedEgg) {
        // Refresh the eggs list from Supabase to get the latest data
        await loadEasterEggs()
      }
    } catch (error) {
      console.error("Error adding egg:", error)
    }
  }

  // Handle authentication success
  const handleAuthSuccess = (userData) => {
    setUser(userData)
    setIsAuthModalOpen(false)
  }

  // Handle logout
  const handleLogout = async () => {
    try {
      await authService.signOut()
      localStorage.removeItem("user")
      setUser(null)
      setUserLikes(new Set())
      setIsMobileProfileOpen(false)
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  // Handle opening mobile user profile
  const handleOpenMobileProfile = () => {
    setIsMobileProfileOpen(true)
  }

  // Handle opening user settings
  const handleOpenUserSettings = () => {
    // TODO: Implement user settings modal
    setIsMobileProfileOpen(false)
    console.log("Open user settings")
  }

  // Filter and sort Easter eggs
  const filteredAndSortedEasterEggs = useMemo(() => {
    let filtered = easterEggs

    // Filter by active tab
    if (activeTab === 'profile' && user) {
      filtered = filtered.filter(egg => egg.user_id === user.id)
    } else if (activeTab === 'favorites' && user) {
      // Show only liked posts
      filtered = filtered.filter(egg => userLikes.has(egg.id))
    } else if (activeTab === 'search') {
      // Only show results if there's an active search
      if (!searchQuery.trim() && selectedAlbum === "All Albums") {
        return []
      }
      
      // Apply search and album filters
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        filtered = filtered.filter(egg => 
          egg.title.toLowerCase().includes(query) ||
          egg.description.toLowerCase().includes(query) ||
          egg.album?.toLowerCase().includes(query)
        )
      }
      
      if (selectedAlbum !== "All Albums") {
        filtered = filtered.filter(egg => egg.album === selectedAlbum)
      }
    }
    // Home tab shows all eggs without filtering

    // Sort
    switch (sortBy) {
      case "date":
        filtered = [...filtered].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        break
      case "likes":
        filtered = [...filtered].sort((a, b) => (b.upvotes_count || 0) - (a.upvotes_count || 0))
        break
      case "comments":
        filtered = [...filtered].sort((a, b) => (b.comments_count || 0) - (a.comments_count || 0))
        break
      default:
        break
    }

    return filtered
  }, [easterEggs, activeTab, user, userLikes, searchQuery, selectedAlbum, sortBy])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header 
        user={user} 
        onLogout={handleLogout}
        onOpenAuthModal={(mode) => {
          setAuthMode(mode)
          setIsAuthModalOpen(true)
        }}
        onOpenUserProfile={handleOpenMobileProfile}
      />

      {/* Auth Notice */}
      {!user && <AuthNotice onOpenAuthModal={() => setIsAuthModalOpen(true)} />}

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Top Navigation */}
        <TopNavigation 
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onOpenAddEggModal={() => setIsAddEggModalOpen(true)}
          user={user}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedAlbum={selectedAlbum}
          setSelectedAlbum={setSelectedAlbum}
          sortBy={sortBy}
          setSortBy={setSortBy}
        />

        {/* Content based on active tab and authentication */}
        {activeTab === 'post' && !user ? (
          <LoginPrompt 
            message="Please log in or create an account to post Easter eggs!"
            onOpenAuthModal={(mode) => {
              setAuthMode(mode)
              setIsAuthModalOpen(true)
            }}
          />
        ) : activeTab === 'profile' && !user ? (
          <LoginPrompt 
            message="Please log in or create an account to view your posts!"
            onOpenAuthModal={(mode) => {
              setAuthMode(mode)
              setIsAuthModalOpen(true)
            }}
          />
        ) : activeTab === 'favorites' && !user ? (
          <LoginPrompt 
            message="Please log in or create an account to view your favorites!"
            onOpenAuthModal={(mode) => {
              setAuthMode(mode)
              setIsAuthModalOpen(true)
            }}
          />
        ) : activeTab === 'profile' && user && !loading && filteredAndSortedEasterEggs.length === 0 ? (
          /* No Posts Message */
          <NoPostsMessage 
            onOpenAddEggModal={() => setIsAddEggModalOpen(true)}
          />
        ) : activeTab === 'favorites' && user && !loading && filteredAndSortedEasterEggs.length === 0 ? (
          /* No Favorites Message */
          <div className="text-center py-16 px-4">
            <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-6">
              <span className="text-2xl">💔</span>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900">
              No favorites yet
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Like some Easter eggs to see them here!
            </p>
          </div>
        ) : activeTab === 'search' && !searchQuery.trim() && selectedAlbum === "All Albums" ? (
          /* Search Prompt */
          <div className="text-center py-16 px-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <span className="text-2xl">🔍</span>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900">
              Start searching
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Use the search bar above to find Easter eggs by title, description, or album!
            </p>
          </div>
        ) : (
          /* Easter Eggs Grid */
          <EasterEggsGrid
            easterEggs={filteredAndSortedEasterEggs}
            userLikes={userLikes}
            onEggClick={handleEggClick}
            onVote={handleVote}
            getAlbumColors={getAlbumColors}
            loading={loading}
            currentUser={user}
            onEditEgg={handleEditEgg}
            activeTab={activeTab}
          />
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Easter Egg Modal */}
      {selectedEgg && (
        <EasterEggModal
          selectedEgg={selectedEgg}
          onClose={() => setSelectedEgg(null)}
          comments={comments}
          newComment={newComment}
          setNewComment={setNewComment}
          onAddComment={handleAddComment}
          onVote={handleVote}
          userLikes={userLikes}
          getAlbumColors={getAlbumColors}
        />
      )}

      {/* Add Easter Egg Modal */}
      <AddEggModal
        isOpen={isAddEggModalOpen}
        onClose={() => setIsAddEggModalOpen(false)}
        onAdd={handleAddEgg}
        user={user}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        mode={authMode}
      />

      {/* Mobile User Profile */}
      <MobileUserProfile
        isOpen={isMobileProfileOpen}
        onClose={() => setIsMobileProfileOpen(false)}
        user={user}
        onLogout={handleLogout}
        onOpenUserSettings={handleOpenUserSettings}
      />

      {/* Bottom Navigation */}
      <BottomNavigation 
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onOpenAddEggModal={() => setIsAddEggModalOpen(true)}
        user={user}
      />
    </div>
  )
} 