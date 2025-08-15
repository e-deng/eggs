"use client"

import { useState, useRef } from "react"
import { X, Upload, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface AddEggModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (egg: any) => void
}

const albums = [
  "Taylor Swift",
  "Fearless",
  "Speak Now", 
  "Red",
  "1989",
  "reputation",
  "Lover",
  "Folklore",
  "Evermore",
  "Midnights",
  "TTPD",
  "The Life of a Showgirl"
]

const mediaTypes = [
  "Music Video",
  "Performance", 
  "Fashion",
  "Photo",
  "Social Media",
  "Interview",
  "Album Art",
  "Music",
  "Other"
]

const clueTypes = [
  "Visual",
  "Color",
  "Hidden Message",
  "Number",
  "Symbol", 
  "Time",
  "Lyric",
  "Other"
]

export default function AddEggModal({ isOpen, onClose, onAdd }: AddEggModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    album: "",
    mediaType: "",
    clueType: "",
    imageFiles: [] as File[],
    videoFiles: [] as File[]
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const files = Array.from(event.target.files || [])
    if (type === 'image') {
      setFormData(prev => ({
        ...prev,
        imageFiles: [...prev.imageFiles, ...files]
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        videoFiles: [...prev.videoFiles, ...files]
      }))
    }
  }

  const handleRemoveFile = (fileToRemove: File, type: 'image' | 'video') => {
    if (type === 'image') {
      setFormData(prev => ({
        ...prev,
        imageFiles: prev.imageFiles.filter(file => file !== fileToRemove)
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        videoFiles: prev.videoFiles.filter(file => file !== fileToRemove)
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.description) {
      alert("Title and description are required!")
      return
    }

    setIsSubmitting(true)
    
    try {
      // Create the new egg object
      const newEgg = {
        id: Date.now().toString(), // Simple ID generation
        ...formData,
        upvotes_count: 0,
        comments_count: 0,
        created_at: new Date().toISOString(),
        image_url: formData.imageFiles.length > 0 ? URL.createObjectURL(formData.imageFiles[0]) : "/placeholder.svg"
      }

      // Call the onAdd function
      onAdd(newEgg)
      
      // Reset form and close modal
      setFormData({
        title: "",
        description: "",
        album: "",
        mediaType: "",
        clueType: "",
        imageFiles: [],
        videoFiles: []
      })
      onClose()
    } catch (error) {
      console.error("Error adding egg:", error)
      alert("Error adding Easter egg. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[95vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b">
          <CardTitle className="text-xl sm:text-2xl font-bold">Add New Easter Egg</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose} className="hover:bg-gray-100">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(95vh-120px)]">
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Title *</label>
                  <Input
                    placeholder="Enter the Easter egg title..."
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    required
                    className="text-base"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Description *</label>
                  <Textarea
                    placeholder="Describe the Easter egg in detail..."
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    rows={4}
                    required
                    className="text-base"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Categorization */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Categorization</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Album</label>
                    <Select value={formData.album} onValueChange={(value) => handleInputChange("album", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select album" />
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

                  <div>
                    <label className="block text-sm font-medium mb-2">Media Type</label>
                    <Select value={formData.mediaType} onValueChange={(value) => handleInputChange("mediaType", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select media type" />
                      </SelectTrigger>
                      <SelectContent>
                        {mediaTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="sm:col-span-2 lg:col-span-1">
                    <label className="block text-sm font-medium mb-2">Clue Type</label>
                    <Select value={formData.clueType} onValueChange={(value) => handleInputChange("clueType", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select clue type" />
                      </SelectTrigger>
                      <SelectContent>
                        {clueTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Media Files */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Media Files</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium mb-2">Images</label>
                  <div className="space-y-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Images
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'image')}
                      className="hidden"
                    />
                    
                    {formData.imageFiles.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                        {formData.imageFiles.map((file, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-20 sm:h-24 object-cover rounded border"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveFile(file, 'image')}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Video Upload */}
                <div>
                  <label className="block text-sm font-medium mb-2">Videos</label>
                  <div className="space-y-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => videoInputRef.current?.click()}
                      className="w-full"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Videos
                    </Button>
                    <input
                      ref={videoInputRef}
                      type="file"
                      multiple
                      accept="video/*"
                      onChange={(e) => handleFileUpload(e, 'video')}
                      className="hidden"
                    />
                    
                    {formData.videoFiles.length > 0 && (
                      <div className="space-y-2">
                        {formData.videoFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded border">
                            <span className="text-sm truncate flex-1 mr-2">{file.name}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveFile(file, 'video')}
                              className="text-red-500 hover:text-red-700 flex-shrink-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? "Adding..." : "Add Easter Egg"}
              </Button>
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
} 