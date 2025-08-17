import React, { useState } from "react"
import { HeartIcon, MessageCircle } from "lucide-react"
import UserAvatar from "./UserAvatar"
import { parseImageUrls } from "../utils/imageUtils"

export default function EasterEggCard({ 
  egg, 
  userLikes, 
  onEggClick, 
  onVote, 
  getAlbumColors,
  currentUser,
  onEditEgg,
  onDeleteEgg,
  activeTab
}) {
  const [zoomedImage, setZoomedImage] = useState(null)
  
  const openImageZoom = (imageUrl) => {
    setZoomedImage(imageUrl)
  }
  
  const closeImageZoom = () => {
    setZoomedImage(null)
  }
  
  return (
    <div
      onClick={() => onEggClick(egg)}
      className="bg-white border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
    >
      <div className="p-4">
        {/* Header with user info and date */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
                          <UserAvatar user={{ username: egg.username, id: egg.user_id }} size="sm" />
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-900">
                  {egg.username || 'Anonymous Hunter'}
                </span>
                {/* Show "You" indicator for user's own posts in other tabs */}
                {activeTab !== 'profile' && currentUser && egg.user_id === currentUser.id && (
                  <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                    You
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-500">
                {new Date(egg.created_at).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit'
                })}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Edit button for user's own posts - only visible in My Posts tab */}
            {activeTab === 'profile' && currentUser && egg.user_id === currentUser.id && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onEditEgg(egg)
                }}
                className="text-gray-500 hover:text-orange-600 p-2 rounded-lg hover:bg-orange-50 transition-colors border border-transparent hover:border-orange-200"
                title="Edit post"
              >
                ✏️
              </button>
            )}
            
            {/* Album tag */}
            {egg.album && (
              <span className={`${getAlbumColors(egg.album).bg} ${getAlbumColors(egg.album).text} text-xs px-2 py-1 rounded-full`}>
                {egg.album}
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="mb-3">
          <h3 className="text-base font-medium text-gray-900 mb-2 leading-relaxed">{egg.title}</h3>
          <p className="text-gray-700 text-sm leading-relaxed">{egg.description}</p>
        </div>

        {/* Images or Video */}
        {egg.image_url && (
          <div className="mb-3">
            {(() => {
              // Use utility function to parse image URLs
              const imageUrls = parseImageUrls(egg.image_url)
              
              // Handle array of image URLs
              if (Array.isArray(imageUrls)) {
                if (imageUrls.length === 1) {
                  return (
                    <img
                      src={imageUrls[0]}
                      alt={egg.title}
                      className={`w-full max-h-80 object-cover rounded-2xl transition-opacity ${
                        activeTab === 'home' ? '' : 'cursor-pointer hover:opacity-90'
                      }`}
                      onClick={activeTab === 'home' ? undefined : (e) => {
                        e.stopPropagation()
                        openImageZoom(imageUrls[0])
                      }}
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
                          className={`w-full h-40 object-cover rounded-2xl transition-opacity ${
                            activeTab === 'home' ? '' : 'cursor-pointer hover:opacity-90'
                          }`}
                          onClick={activeTab === 'home' ? undefined : (e) => {
                            e.stopPropagation()
                            openImageZoom(imageUrl)
                          }}
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
                    alt={egg.title}
                    className={`w-full max-h-80 object-cover rounded-2xl transition-opacity ${
                      activeTab === 'home' ? '' : 'cursor-pointer hover:opacity-90'
                    }`}
                    onClick={activeTab === 'home' ? undefined : (e) => {
                      e.stopPropagation()
                      openImageZoom(imageUrls)
                    }}
                  />
                )
              }
              
              // Handle case where image_url might be malformed
              return null
            })()}
          </div>
        )}
        
        {egg.video_url && !egg.image_url && (
          <div className="mb-3">
            <video
              src={egg.video_url}
              controls
              className="w-full max-h-80 object-cover rounded-2xl"
            />
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-8">
            {/* Like button */}
            <button
              className={`flex items-center space-x-2 text-sm transition-colors ${
                userLikes.has(egg.id) 
                  ? 'text-orange-500' 
                  : 'text-gray-500 hover:text-red-500'
              }`}
              onClick={(e) => {
                e.stopPropagation()
                onVote(egg.id, 'upvote')
              }}
            >
              <HeartIcon className={`h-5 w-5 ${userLikes.has(egg.id) ? 'fill-current' : ''}`} />
              <span>{egg.upvotes_count || 0}</span>
            </button>
            
            {/* Comment button */}
            <button
              className="flex items-center space-x-2 text-sm text-gray-500 hover:text-blue-500 transition-colors"
              onClick={(e) => {
                e.stopPropagation()
                onEggClick(egg)
              }}
            >
              <MessageCircle className="h-5 w-5" />
              <span>{egg.comments_count || 0}</span>
            </button>
          </div>

          {/* Additional tags */}
          <div className="flex space-x-2">
            {egg.media_type && (
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {egg.media_type}
              </span>
            )}
            {egg.clue_type && (
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {egg.clue_type}
              </span>
            )}
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