import React, { useState } from "react"
import { X, Upload, Image as ImageIcon, Plus } from "lucide-react"

export default function AddEggModal({ isOpen, onClose, onAdd, user }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    album: "",
    media_type: "",
    clue_type: "",
    image_url: "",
    video_url: ""
  })
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [isUploading, setIsUploading] = useState(false)

  const albums = ["Taylor Swift", "Fearless", "Speak Now", "Red", "1989", "Reputation", "Lover", "Folklore", "Evermore", "Midnights", "TTPD", "The Life of a Showgirl"]
  const mediaTypes = ["Album Art", "Music Video", "Music", "Performance", "Interview", "Social Media", "Other"]
  const clueTypes = ["Visual", "Color", "Symbol", "Time", "Number", "Lyrics", "Fashion", "Other"]

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

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB')
        return
      }
      
      setSelectedImage(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.currentTarget.classList.add('border-purple-400', 'bg-purple-50')
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.currentTarget.classList.remove('border-purple-400', 'bg-purple-50')
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.currentTarget.classList.remove('border-purple-400', 'bg-purple-50')
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      const file = files[0]
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file')
        return
      }
      
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB')
        return
      }
      
      setSelectedImage(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    setIsUploading(true)
    
    try {
      const formDataToSend = new FormData()
      
      // Add all form fields
      Object.keys(formData).forEach(key => {
        if (formData[key]) {
          formDataToSend.append(key, formData[key])
        }
      })
      
      // Add image file if selected
      if (selectedImage) {
        formDataToSend.append('image', selectedImage)
      }
      
      // Add default values
      formDataToSend.append('upvotes_count', '0')
      formDataToSend.append('comments_count', '0')
      formDataToSend.append('created_at', new Date().toISOString())
      formDataToSend.append('updated_at', new Date().toISOString())
      
      // Call the onAdd function with FormData
      await onAdd(formDataToSend)
      
      // Reset form
      setFormData({
        title: "",
        description: "",
        album: "",
        media_type: "",
        clue_type: "",
        image_url: "",
        video_url: ""
      })
      setSelectedImage(null)
      setImagePreview(null)
      onClose()
    } catch (error) {
      console.error('Error submitting form:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const removeImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Add New Easter Egg
            </h2>
            {user ? (
              <p className="text-sm text-gray-600 mt-1">
                Adding as <span className="font-medium text-orange-600">{user.username}</span>
              </p>
            ) : (
              <p className="text-sm text-orange-600 mt-1">
                Please sign in to add Easter eggs
              </p>
            )}
          </div>
          <button 
            onClick={onClose}
            className="hover:bg-gray-100 p-2 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
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

          {/* Image Upload Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Easter Egg Image *
            </label>
            
            {!imagePreview ? (
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                  required
                />
                <label htmlFor="image-upload" className="cursor-pointer">
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
            ) : (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
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
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Video URL (Optional)
            </label>
            <input
              type="url"
              name="video_url"
              value={formData.video_url}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="https://example.com/video.mp4"
            />
          </div>

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
              disabled={!user || isUploading}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                user 
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isUploading ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Uploading...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <Plus className="h-5 w-5 mr-2" />
                  {user ? 'Add Easter Egg' : 'Sign In Required'}
                </span>
              )}
            </button>
          </div>
        </form>

        {!user && (
          <div className="mt-6 p-4 bg-orange-50 rounded-lg">
            <p className="text-sm text-orange-800 text-center">
              <strong>🔐 Sign in required!</strong> You need an account to share Easter eggs with the community.
            </p>
          </div>
        )}
      </div>
    </div>
  )
} 