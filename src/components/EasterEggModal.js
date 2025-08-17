import React, { useState } from "react"
import { HeartIcon, MessageCircle } from "lucide-react"
import CommentsSection from "./CommentsSection"
import UserAvatar from "./UserAvatar"
import { parseImageUrls } from "../utils/imageUtils"

export default function EasterEggModal({ 
  selectedEgg, 
  onClose, 
  comments, 
  newComment, 
  setNewComment, 
  onAddComment, 
  onVote, 
  userLikes, 
  getAlbumColors,
  currentUser,
  onReply,
  onUpvote,
  onDelete
}) {
  const [zoomedImage, setZoomedImage] = useState(null)
  
  const openImageZoom = (imageUrl) => {
    setZoomedImage(imageUrl)
  }
  
  const closeImageZoom = () => {
    setZoomedImage(null)
  }
  if (!selectedEgg) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Easter Egg Details</h2>
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="p-4 sm:p-6">
            {/* User info and date */}
            <div className="flex items-center space-x-3 mb-4">
              <UserAvatar user={{ username: selectedEgg.username, id: selectedEgg.user_id }} size="sm" />
              <div>
                <div className="font-medium text-gray-900">
                  {selectedEgg.username || 'Anonymous Hunter'}
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(selectedEgg.created_at).toLocaleDateString('en-US', { 
                    month: 'long', 
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{selectedEgg.title}</h3>
              <p className="text-gray-700 text-base leading-relaxed">{selectedEgg.description}</p>
            </div>

            {/* Images or Video */}
            {selectedEgg.image_url && (
              <div className="mb-4">
                {(() => {
                  // Use utility function to parse image URLs
                  const imageUrls = parseImageUrls(selectedEgg.image_url)
                  
                  // Handle array of image URLs
                  if (Array.isArray(imageUrls)) {
                    if (imageUrls.length === 1) {
                      return (
                        <img
                          src={imageUrls[0]}
                          alt={selectedEgg.title}
                          className="w-full max-h-96 object-cover rounded-2xl cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => openImageZoom(imageUrls[0])}
                        />
                      )
                    } else {
                      return (
                        <div className="grid grid-cols-2 gap-2">
                          {imageUrls.map((imageUrl, index) => (
                            <img
                              key={index}
                              src={imageUrl}
                              alt={`${index + 1}`}
                              className="w-full h-48 object-cover rounded-2xl cursor-pointer hover:opacity-90 transition-opacity"
                              onClick={() => openImageZoom(imageUrl)}
                            />
                          ))}
                        </div>
                      )
                    }
                  }
                  
                  // Handle string (backward compatibility)
                  if (typeof imageUrls === 'string') {
                    return (
                      <img
                        src={imageUrls}
                        alt={selectedEgg.title}
                        className="w-full max-h-96 object-cover rounded-2xl cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => openImageZoom(imageUrls)}
                      />
                    )
                  }
                  
                  // Handle case where image_url might be malformed
                  console.warn('Modal - Unexpected image_url format:', imageUrls)
                  return null
                })()}
              </div>
            )}
            
            {selectedEgg.video_url && !selectedEgg.image_url && (
              <div className="mb-4">
                <video
                  src={selectedEgg.video_url}
                  controls
                  className="w-full max-h-96 object-cover rounded-2xl"
                />
              </div>
            )}

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedEgg.album && (
                <span className={`${getAlbumColors(selectedEgg.album).bg} ${getAlbumColors(selectedEgg.album).text} text-xs px-3 py-1 rounded-full`}>
                  {selectedEgg.album}
                </span>
              )}
              {selectedEgg.media_type && (
                <span className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full">
                  {selectedEgg.media_type}
                </span>
              )}
              {selectedEgg.clue_type && (
                <span className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full">
                  {selectedEgg.clue_type}
                </span>
              )}
            </div>

            {/* Stats */}
            <div className="flex items-center space-x-6 mb-6 pb-4 border-b border-gray-200">
              <button
                onClick={() => onVote(selectedEgg.id, 'upvote')}
                className={`flex items-center space-x-2 transition-colors ${
                  userLikes.has(selectedEgg.id)
                    ? 'text-orange-500' 
                    : 'text-gray-500 hover:text-red-500'
                }`}
              >
                <HeartIcon className={`h-5 w-5 ${userLikes.has(selectedEgg.id) ? 'fill-current' : ''}`} />
                <span className="text-sm font-medium">{selectedEgg.upvotes_count || 0} likes</span>
              </button>
              <div className="flex items-center space-x-2 text-gray-500">
                <MessageCircle className="h-5 w-5" />
                <span className="text-sm font-medium">{selectedEgg.comments_count || 0} comments</span>
              </div>
            </div>

            {/* Comments Section */}
            <CommentsSection
              comments={comments}
              newComment={newComment}
              setNewComment={setNewComment}
              onAddComment={onAddComment}
              currentUser={currentUser}
              onReply={onReply}
              onUpvote={onUpvote}
              onDelete={onDelete}
            />
          </div>
        </div>
      </div>
      
      {/* Image Zoom Modal */}
      {zoomedImage && (
        <div 
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
          onClick={closeImageZoom}
        >
          <div className="relative max-w-full max-h-full">
            <img
              src={zoomedImage}
              alt="Zoomed"
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={closeImageZoom}
              className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  )
} 