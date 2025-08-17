import React, { useState, useEffect } from "react"
import { X } from "lucide-react"
import { parseImageUrls } from "../utils/imageUtils"
import ConfirmDialog from "./ConfirmDialog"

export default function EditEggModal({ isOpen, onClose, egg, onUpdate, onDelete, user }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    album: "",
    media_type: "",
    clue_type: ""
  })
  
  const [imagePreviews, setImagePreviews] = useState([])
  const [isUploading, setIsUploading] = useState(false)
  const [removeCurrentImages, setRemoveCurrentImages] = useState(false)
  const [deletedImageUrls, setDeletedImageUrls] = useState([])
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const albums = ["Taylor Swift", "Fearless", "Speak Now", "Red", "1989", "Reputation", "Lover", "Folklore", "Evermore", "Midnights", "TTPD", "The Life of a Showgirl"]
  const mediaTypes = ["Album Art", "Music Video", "Music", "Performance", "Interview", "Social Media", "Other"]
  const clueTypes = ["Visual", "Color", "Symbol", "Time", "Number", "Lyrics", "Fashion", "Other"]

  // Initialize form data when egg changes
  useEffect(() => {
    if (egg) {
      setFormData({
        title: egg.title || "",
        description: egg.description || "",
        album: egg.album || "",
        media_type: egg.media_type || "",
        clue_type: egg.clue_type || ""
      })
      
      // Use utility function to parse image URLs
      const currentImages = parseImageUrls(egg.image_url)
      setImagePreviews(currentImages)
      setRemoveCurrentImages(false)
    }
  }, [egg])





  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      alert('Please enter a title for your Easter egg')
      return
    }
    
    if (!formData.description.trim()) {
      alert('Please enter a description for your Easter egg')
      return
    }
    
    setIsUploading(true)
    
    try {
      const formDataToSend = new FormData()
      
      // Add form fields
      formDataToSend.append('title', formData.title.trim())
      formDataToSend.append('description', formData.description.trim())
      if (formData.album) formDataToSend.append('album', formData.album)
      if (formData.media_type) formDataToSend.append('media_type', formData.media_type)
      if (formData.clue_type) formDataToSend.append('clue_type', formData.clue_type)
      
      // Handle image deletions only
      if (deletedImageUrls.length > 0) {
        deletedImageUrls.forEach(imageUrl => {
          formDataToSend.append('deleted_images', imageUrl)
        })
      }
      
      if (removeCurrentImages) {
        formDataToSend.append('remove_images', 'true')
      }
      
      // Call the update function
      await onUpdate(egg.id, formDataToSend)
      
      // Reset form
      setRemoveCurrentImages(false)
      setDeletedImageUrls([])
      
      onClose()
    } catch (error) {
      console.error('Error updating egg:', error)
      alert('Failed to update Easter egg. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const removeIndividualImage = (index) => {
    const imageToRemove = imagePreviews[index]
    console.log('Removing individual image:', imageToRemove, 'at index:', index)
    
    // Add to deleted images list for backend cleanup
    setDeletedImageUrls(prev => [...prev, imageToRemove])
    
    // Remove from current previews
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
    
    // If this was the last image, mark for complete removal
    if (imagePreviews.length === 1) {
      setRemoveCurrentImages(true)
    }
  }

  const removeImage = () => {
    if (egg.image_url) {
      setRemoveCurrentImages(true)
      setImagePreviews([])
      // Mark all current images for deletion
      setDeletedImageUrls(imagePreviews)
    }
  }



  if (!isOpen || !egg) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-2xl font-bold text-gray-900">Edit Easter Egg</h2>
          <button 
            onClick={onClose}
            className="hover:bg-gray-100 p-2 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="e.g., Midnight Clock at 3 AM"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Album
                </label>
                <select
                  name="album"
                  value={formData.album}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Select an album</option>
                  {albums.map((album) => (
                    <option key={album} value={album}>
                      {album}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Describe the Easter egg and its significance..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Media Type
                </label>
                <select
                  name="media_type"
                  value={formData.media_type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Select media type</option>
                  {mediaTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Clue Type
                </label>
                <select
                  name="clue_type"
                  value={formData.clue_type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Select clue type</option>
                  {clueTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Image Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Easter Egg Images
              </label>
              
              {/* Current Images */}
              {(() => {
                if (imagePreviews.length > 0) {
                  return (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2">Current images ({imagePreviews.length}):</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {imagePreviews.map((image, index) => (
                          <div key={index} className="relative">
                            <img
                              src={image}
                              alt={`Current image ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg border border-gray-200"
                              onError={(e) => console.error(`Failed to load image ${index}:`, image, e)}
                              onLoad={() => console.log(`Successfully loaded image ${index}:`, image)}
                            />
                            <button
                              type="button"
                              onClick={() => removeIndividualImage(index)}
                              className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                              title="Remove this image"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={removeImage}
                        className="mt-2 text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        Remove all current images
                      </button>
                    </div>
                  )
                } else {
                  return (
                    <div className="mb-4">
                      <p className="text-sm text-gray-500">No current images</p>
                    </div>
                  )
                }
              })()}
              
              {/* Note: Images can only be removed in edit mode, not added */}
              <div className="text-sm text-gray-500 text-center py-2">
                💡 Images can only be removed in edit mode. To add new images, create a new post.
              </div>
            </div>

            {/* Video Section - Read Only */}
            {egg.video_url && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Video (Read Only)
                </label>
                <div className="relative">
                  <video
                    src={egg.video_url}
                    controls
                    className="w-full h-48 object-cover rounded-lg border border-gray-200"
                  />
                  <div className="absolute top-2 right-2 bg-gray-800 text-white px-2 py-1 rounded text-xs">
                    Read Only
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  💡 Videos cannot be modified in edit mode. Create a new post to change videos.
                </p>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-between items-center pt-4">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="px-6 py-2 border border-red-300 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
              >
                Delete Post
              </button>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {isUploading ? (
                    <span className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Updating...
                    </span>
                  ) : (
                    'Update Easter Egg'
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
      
      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => onDelete && onDelete(egg.id)}
        title="Delete Post"
        message="Are you sure you want to delete this post? This action cannot be undone and will delete all comments and images."
        confirmText="Delete Post"
        type="danger"
      />
    </div>
  )
} 