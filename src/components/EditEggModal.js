import React, { useState, useEffect } from "react"
import { X, Upload } from "lucide-react"

export default function EditEggModal({ isOpen, onClose, egg, onUpdate, user }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    album: "",
    media_type: "",
    clue_type: ""
  })
  
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [selectedVideo, setSelectedVideo] = useState(null)
  const [videoPreview, setVideoPreview] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [removeCurrentImage, setRemoveCurrentImage] = useState(false)
  const [removeCurrentVideo, setRemoveCurrentVideo] = useState(false)

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
      setImagePreview(egg.image_url || null)
      setVideoPreview(egg.video_url || null)
      setRemoveCurrentImage(false)
      setRemoveCurrentVideo(false)
    }
  }, [egg])

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB')
        return
      }
      
      setSelectedImage(file)
      setRemoveCurrentImage(false)
      
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleVideoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 100 * 1024 * 1024) {
        alert('Video file size must be less than 100MB')
        return
      }
      
      if (!file.type.startsWith('video/')) {
        alert('Please upload a video file')
        return
      }
      
      setSelectedVideo(file)
      setRemoveCurrentVideo(false)
      
      const reader = new FileReader()
      reader.onload = (e) => {
        setVideoPreview(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

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
      
      // Handle image changes
      if (selectedImage) {
        formDataToSend.append('image', selectedImage)
      } else if (removeCurrentImage) {
        formDataToSend.append('remove_image', 'true')
      }
      
      // Handle video changes
      if (selectedVideo) {
        formDataToSend.append('video', selectedVideo)
      } else if (removeCurrentVideo) {
        formDataToSend.append('remove_video', 'true')
      }
      
      // Call the update function
      await onUpdate(egg.id, formDataToSend)
      
      // Reset form
      setSelectedImage(null)
      setSelectedVideo(null)
      setRemoveCurrentImage(false)
      setRemoveCurrentVideo(false)
      
      onClose()
    } catch (error) {
      console.error('Error updating egg:', error)
      alert('Failed to update Easter egg. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const removeImage = () => {
    if (egg.image_url && !selectedImage) {
      setRemoveCurrentImage(true)
      setImagePreview(null)
    } else {
      setSelectedImage(null)
      setImagePreview(null)
      setRemoveCurrentImage(false)
    }
  }

  const removeVideo = () => {
    if (egg.video_url && !selectedVideo) {
      setRemoveCurrentVideo(true)
      setVideoPreview(null)
    } else {
      setSelectedVideo(null)
      setVideoPreview(null)
      setRemoveCurrentVideo(false)
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                Easter Egg Image
              </label>
              
              {imagePreview ? (
                <div className="relative">
                  {/* eslint-disable-next-line jsx-a11y/img-redundant-alt */}
                  <img
                    src={imagePreview}
                    alt="Current image"
                    className="w-full h-48 object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="edit-image-upload"
                  />
                  <label htmlFor="edit-image-upload" className="cursor-pointer">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">
                      <span className="font-medium text-purple-600 hover:text-purple-500">
                        Click to upload
                      </span>{" "}
                      or drag and drop
                    </p>
                    <p className="text-sm text-gray-500">
                      PNG, JPG, GIF up to 5MB
                    </p>
                  </label>
                </div>
              )}
            </div>

            {/* Video Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Video
              </label>
              
              {videoPreview ? (
                <div className="relative">
                  <video
                    src={videoPreview}
                    controls
                    className="w-full h-48 object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={removeVideo}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoChange}
                    className="hidden"
                    id="edit-video-upload"
                  />
                  <label htmlFor="edit-video-upload" className="cursor-pointer">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">
                      <span className="font-medium text-purple-600 hover:text-purple-500">
                        Click to upload
                      </span>{" "}
                      or drag and drop
                    </p>
                    <p className="text-sm text-gray-500">
                      MP4, MOV, AVI up to 100MB
                    </p>
                  </label>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-3 pt-4">
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
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
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
          </form>
        </div>
      </div>
    </div>
  )
} 