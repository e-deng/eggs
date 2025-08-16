import React, { useState, useEffect, useMemo, useCallback } from "react"
import AddEggModal from "./components/AddEggModal"
import AuthModal from "./components/AuthModal"
import Header from "./components/Header"
import AuthNotice from "./components/AuthNotice"
import TopNavigation from "./components/TopNavigation"
import BottomNavigation from "./components/BottomNavigation"
import SearchFilters from "./components/SearchFilters"
import EasterEggsGrid from "./components/EasterEggsGrid"
import EasterEggModal from "./components/EasterEggModal"
import EditEggModal from "./components/EditEggModal"
import LoginPrompt from "./components/LoginPrompt"
import NoPostsMessage from "./components/NoPostsMessage"

import { getAlbumColors } from "./utils/albumColors"
import { easterEggsService, commentsService, likesService } from "./services/supabaseService"
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

  // Check if user is authenticated on app load
  const checkAuthStatus = useCallback(async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (user && !error) {
        setUser(user)
        // We'll call loadUserLikes after it's defined
      } else {
        // No valid session, clear storage
        localStorage.removeItem("sessionToken")
        localStorage.removeItem("user")
        setUser(null)
      }
    } catch (error) {
      console.error("Auth check failed:", error)
      localStorage.removeItem("sessionToken")
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
    checkAuthStatus()
  }, [checkAuthStatus])

  // Load user likes when user changes
  useEffect(() => {
    if (user) {
      loadUserLikes()
    }
  }, [user, loadUserLikes])

  // Handle authentication success
  const handleAuthSuccess = (userData) => {
    setUser(userData)
    loadUserLikes()
  }

  // Handle logout
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      localStorage.removeItem("sessionToken")
      localStorage.removeItem("user")
      setUser(null)
      setUserLikes(new Set())
    }
  }

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

  // Load comments for a specific Easter egg
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

  // Handle Easter egg click
  const handleEggClick = async (egg) => {
    setSelectedEgg(egg)
    await loadComments(egg.id)
    setNewComment("")
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

  // Filter and sort Easter eggs
  const filteredAndSortedEasterEggs = useMemo(() => {
    let filtered = easterEggs.filter((egg) => {
      // Only apply search and album filters when on search tab
      if (activeTab === 'search') {
        // Only show results if there's an active search
        if (!searchQuery.trim() && selectedAlbum === "All Albums") {
          return false
        }
        
        const matchesSearch = searchQuery.trim() === "" || 
          egg.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          egg.description?.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesAlbum = selectedAlbum === "All Albums" || egg.album === selectedAlbum

        return matchesSearch && matchesAlbum
      }

      // Filter by active tab (home or profile)
      if (activeTab === "home") {
        return true // Show all eggs
      } else if (activeTab === "profile") {
        if (!user) {
          return false // Don't show anything on profile tab if not logged in
        }
        return egg.user_id === user.id // Show only user's eggs
      }

      return false
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
  }, [easterEggs, searchQuery, selectedAlbum, sortBy, activeTab, user])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Header */}
      <Header
        user={user}
        onLogout={handleLogout}
        onOpenAuthModal={(mode) => {
          setAuthMode(mode)
          setIsAuthModalOpen(true)
        }}

      />

      {/* Authentication Notice */}
      {!user && (
        <AuthNotice
          onOpenAuthModal={(mode) => {
            setAuthMode(mode)
            setIsAuthModalOpen(true)
          }}
        />
      )}

      {/* Top Navigation for Web Users */}
      <TopNavigation
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onOpenAddEggModal={() => setIsAddEggModalOpen(true)}
        user={user}
      />

      {/* Main Content */}
      <main className="max-w-2xl mx-auto pb-20 md:pb-0">
        {/* Search and Filters */}
        <SearchFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedAlbum={selectedAlbum}
          setSelectedAlbum={setSelectedAlbum}
          sortBy={sortBy}
          setSortBy={setSortBy}
          getAlbumColors={getAlbumColors}
          activeTab={activeTab}
          filteredAndSortedEasterEggs={filteredAndSortedEasterEggs}
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
        ) : activeTab === 'profile' && user && !loading && filteredAndSortedEasterEggs.length === 0 ? (
          /* No Posts Message */
          <NoPostsMessage 
            onOpenAddEggModal={() => setIsAddEggModalOpen(true)}
          />
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

      {/* Edit Easter Egg Modal */}
      <EditEggModal
        isOpen={isEditEggModalOpen}
        onClose={() => {
          setIsEditEggModalOpen(false)
          setEditingEgg(null)
        }}
        egg={editingEgg}
        onUpdate={handleUpdateEgg}
        user={user}
      />



      {/* Bottom Navigation for Mobile Users */}
      <BottomNavigation
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onOpenAddEggModal={() => setIsAddEggModalOpen(true)}
        user={user}
      />
    </div>
  )
} 