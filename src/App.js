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
import { easterEggsService, commentsService, likesService, commentLikesService } from "./services/supabaseService"
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
      const { data: comments, error } = await commentsService.getComments(easterEggId, user?.id)
      
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
        username: user.username, // Use 'username' field as per actual database schema
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

  // Handle adding a reply to a comment
  const handleAddReply = async (parentCommentId, replyText) => {
    if (!user) {
      setIsAuthModalOpen(true)
      setAuthMode("login")
      return
    }

    if (!replyText.trim() || !selectedEgg) return

    try {
      const { error } = await commentsService.addReply(parentCommentId, {
        easter_egg_id: selectedEgg.id,
        user_id: user.id,
        username: user.username, // Use 'username' field as per actual database schema
        content: replyText.trim()
      })

      if (error) {
        throw new Error("Failed to add reply")
      }

      // Refresh comments to get the updated structure
      await loadComments(selectedEgg.id)

      // Refresh the Easter eggs list to update comment count
      await loadEasterEggs()
      
      // Also refresh the selected egg
      const updatedEgg = easterEggs.find(egg => egg.id === selectedEgg.id)
      if (updatedEgg) {
        setSelectedEgg(updatedEgg)
      }
    } catch (error) {
      console.error("Error adding reply:", error)
    }
  }

  // Handle comment upvote/downvote
  const handleCommentUpvote = async (commentId) => {
    if (!user) {
      setIsAuthModalOpen(true)
      setAuthMode("login")
      return
    }

    try {
      const { error } = await commentLikesService.toggleCommentLike(user.id, commentId)
      
      if (error) {
        throw new Error('Failed to update comment like')
      }

      // Refresh comments to get updated upvote counts
      await loadComments(selectedEgg.id)
    } catch (error) {
      console.error("Error updating comment like:", error)
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

  // Helper function to delete images from storage
  const deleteImagesFromStorage = async (imageUrls) => {
    if (!imageUrls || imageUrls.length === 0) return
    
    for (const imageUrl of imageUrls) {
      try {
        // Extract the file path from the URL
        // URL format: https://.../storage/v1/object/public/easter-egg-images/filename.png
        const urlParts = imageUrl.split('/')
        const filename = urlParts[urlParts.length - 1]
        
        if (filename) {
          const { error } = await supabase.storage
            .from('easter-egg-images')
            .remove([filename])
          
          if (error) {
            console.error('Failed to delete image from storage:', filename, error)
          }
        }
      } catch (error) {
        console.error('Error deleting image from storage:', imageUrl, error)
      }
    }
  }

  // Handle updating an Easter egg
  const handleUpdateEgg = async (eggId, updatedData) => {
    try {
      // Handle new image uploads if provided
      let imageUrls = []
      const imageFiles = updatedData.getAll('images')
      if (imageFiles.length > 0) {
        for (const imageFile of imageFiles) {
          try {
            const imagePath = `${Date.now()}-${imageFile.name}`
            
            // Upload to Supabase storage
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('easter-egg-images')
              .upload(imagePath, imageFile)

            if (uploadError) {
              console.error('Image upload error:', uploadError)
              // Check if it's a bucket not found error
              if (uploadError.message.includes('Bucket not found') || uploadError.message.includes('bucket')) {
                throw new Error('BUCKET_NOT_FOUND')
              }
              throw new Error('Failed to upload image. Please try again.')
            }

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
              .from('easter-egg-images')
              .getPublicUrl(imagePath)
          
            imageUrls.push(publicUrl)
          } catch (error) {
            if (error.message.includes('BUCKET_NOT_FOUND') || error.message.includes('bucket') || error.message.includes('not found')) {
              console.warn('Storage bucket not available, using data URL fallback')
              // Fallback: convert image to data URL and store in database
              const reader = new FileReader()
              const imageDataUrl = await new Promise((resolve, reject) => {
                reader.onload = () => resolve(reader.result)
                reader.onerror = reject
                reader.readAsDataURL(imageFile)
              })
              imageUrls.push(imageDataUrl)
            } else {
              throw error
            }
          }
        }
      }

      // Handle new video upload if provided
      let videoUrl = null
      if (updatedData.get('video')) {
        const videoFile = updatedData.get('video')
        try {
          const videoPath = `${Date.now()}-${videoFile.name}`
          
          // Upload to Supabase storage
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('easter-egg-videos')
            .upload(videoPath, videoFile)

          if (uploadError) {
            console.error('Video upload error:', uploadError)
            // Check if it's a bucket not found error
            if (uploadError.message.includes('Bucket not found') || uploadError.message.includes('bucket')) {
              throw new Error('BUCKET_NOT_FOUND')
            }
            throw new Error('Failed to upload video. Please try again.')
          }

          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('easter-egg-videos')
            .getPublicUrl(videoPath)
        
          videoUrl = publicUrl
        } catch (error) {
          if (error.message.includes('BUCKET_NOT_FOUND') || error.message.includes('bucket') || error.message.includes('not found')) {
            console.warn('Storage bucket not available, using data URL fallback')
            // Fallback: convert video to data URL and store in database
            const reader = new FileReader()
            const videoDataUrl = await new Promise((resolve, reject) => {
              reader.onload = () => resolve(reader.result)
              reader.onerror = reject
              reader.readAsDataURL(videoFile)
            })
            videoUrl = videoDataUrl
          } else {
            throw error
          }
        }
      }

      // Convert FormData to regular object for Supabase
      const eggData = {
        title: updatedData.get('title'),
        description: updatedData.get('description'),
        album: updatedData.get('album') || null,
        media_type: updatedData.get('media_type') || null,
        clue_type: updatedData.get('clue_type') || null
      }
      
      // Import the parseImageUrls utility
      const { parseImageUrls } = await import('./utils/imageUtils.js')
      
      // Handle image changes
      if (imageUrls.length > 0) {
        // Parse existing images properly
        const existingImages = parseImageUrls(editingEgg.image_url)
        
        // Remove deleted images from remaining images
        const deletedImageUrls = updatedData.getAll('deleted_images')
        const finalImages = existingImages.filter(img => !deletedImageUrls.includes(img))
        
        // Add new images
        eggData.image_url = [...finalImages, ...imageUrls]
        
        // Delete removed images from storage
        await deleteImagesFromStorage(deletedImageUrls)
      } else if (updatedData.get('remove_images') === 'true') {
        eggData.image_url = null
        // Delete all existing images from storage
        if (editingEgg.image_url) {
          const existingImages = parseImageUrls(editingEgg.image_url)
          await deleteImagesFromStorage(existingImages)
        }
      } else {
        // Keep existing images if no changes, but remove any deleted ones
        const deletedImageUrls = updatedData.getAll('deleted_images')
        if (deletedImageUrls.length > 0) {
          const existingImages = parseImageUrls(editingEgg.image_url)
          eggData.image_url = existingImages.filter(img => !deletedImageUrls.includes(img))
          
          // Delete removed images from storage
          await deleteImagesFromStorage(deletedImageUrls)
        } else {
          eggData.image_url = editingEgg.image_url
        }
      }
      
      // Handle video changes
      if (videoUrl) {
        eggData.video_url = videoUrl
      } else if (updatedData.get('remove_video') === 'true') {
        eggData.video_url = null
      } else {
        // Keep existing video if no changes
        eggData.video_url = editingEgg.video_url
      }
      
      const { error } = await easterEggsService.updateEasterEgg(eggId, eggData)
      
      if (error) {
        throw new Error('Failed to update Easter egg')
      }

      // Refresh the Easter eggs list
      await loadEasterEggs()
      
      // Close the edit modal
      setIsEditEggModalOpen(false)
      setEditingEgg(null)
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
            // Handle image uploads if provided
      let imageUrls = []
      const imageFiles = newEgg.getAll('images')
      if (imageFiles.length > 0) {
        for (const imageFile of imageFiles) {
          try {
            const imagePath = `${Date.now()}-${imageFile.name}`
            
            // Upload to Supabase storage
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('easter-egg-images')
              .upload(imagePath, imageFile)

            if (uploadError) {
              console.error('Image upload error:', uploadError)
              // Check if it's a bucket not found error
              if (uploadError.message.includes('Bucket not found') || uploadError.message.includes('bucket')) {
                throw new Error('BUCKET_NOT_FOUND')
              }
              throw new Error('Failed to upload image. Please try again.')
            }

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
              .from('easter-egg-images')
              .getPublicUrl(imagePath)
          
            imageUrls.push(publicUrl)
          } catch (error) {
            if (error.message.includes('BUCKET_NOT_FOUND') || error.message.includes('bucket') || error.message.includes('not found')) {
              console.warn('Storage bucket not available, using data URL fallback')
              // Fallback: convert image to data URL and store in database
              const reader = new FileReader()
              const imageDataUrl = await new Promise((resolve, reject) => {
                reader.onload = () => resolve(reader.result)
                reader.onerror = reject
                reader.readAsDataURL(imageFile)
              })
              imageUrls.push(imageDataUrl)
            } else {
              throw error
            }
          }
        }
      }

      // Handle video upload if provided
      let videoUrl = null
      if (newEgg.get('video')) {
        const videoFile = newEgg.get('video')
        try {
          const videoPath = `${Date.now()}-${videoFile.name}`
          
          // Upload to Supabase storage
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('easter-egg-videos')
            .upload(videoPath, videoFile)

          if (uploadError) {
            console.error('Video upload error:', uploadError)
            // Check if it's a bucket not found error
            if (uploadError.message.includes('Bucket not found') || uploadError.message.includes('bucket')) {
              throw new Error('BUCKET_NOT_FOUND')
            }
            throw new Error('Failed to upload video. Please try again.')
          }

          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('easter-egg-videos')
            .getPublicUrl(videoPath)
          
          videoUrl = publicUrl
        } catch (error) {
          if (error.message.includes('BUCKET_NOT_FOUND') || error.message.includes('bucket') || error.message.includes('not found')) {
            console.warn('Storage bucket not available, using data URL fallback')
            // Fallback: convert video to data URL and store in database
            const reader = new FileReader()
            const videoDataUrl = await new Promise((resolve, reject) => {
              reader.onload = () => resolve(reader.result)
              reader.onerror = reject
              reader.readAsDataURL(videoFile)
            })
            videoUrl = videoDataUrl
          } else {
            throw error
          }
        }
      }

      // Convert FormData to regular object for Supabase
      const eggData = {
        title: newEgg.get('title'),
        description: newEgg.get('description'),
        album: newEgg.get('album'),
        media_type: newEgg.get('media_type'),
        clue_type: newEgg.get('clue_type'),
        user_id: user.id,
        username: user.username,
        image_url: imageUrls.length > 0 ? imageUrls : null,
        video_url: videoUrl
      }
      
      console.log('Uploading egg with image_url:', eggData.image_url)

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
      throw error
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
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
      <main className="flex-1 max-w-4xl mx-auto px-4 py-6">
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
          currentUser={user}
          onReply={handleAddReply}
          onUpvote={handleCommentUpvote}
        />
      )}

      {/* Add Easter Egg Modal */}
      <AddEggModal
        isOpen={isAddEggModalOpen}
        onClose={() => setIsAddEggModalOpen(false)}
        onAdd={handleAddEgg}
        user={user}
      />

      {/* Edit Easter Egg Modal */}
      <EditEggModal
        isOpen={isEditEggModalOpen}
        onClose={() => setIsEditEggModalOpen(false)}
        onUpdate={handleUpdateEgg}
        egg={editingEgg}
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