import React, { useState } from "react"
import { MessageCircle, Heart, Reply } from "lucide-react"
import UserAvatar from "./UserAvatar"

export default function Comment({ 
  comment, 
  currentUser, 
  onReply, 
  onUpvote,
  maxDepth = 3
}) {
  // Use the calculated depth from the comment object, or default to 0
  const depth = comment.depth || 0
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [replyText, setReplyText] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Debug logging
  console.log('Comment render:', { 
    id: comment.id, 
    depth, 
    hasReplies: comment.replies?.length > 0,
    replies: comment.replies,
    parentId: comment.parent_comment_id || comment.temp_parent_id
  })

  const handleReply = async () => {
    if (!replyText.trim() || !currentUser) return
    
    setIsSubmitting(true)
    try {
      await onReply(comment.id, replyText)
      setReplyText("")
      setShowReplyForm(false)
    } catch (error) {
      console.error("Error adding reply:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpvote = async () => {
    if (!currentUser) return
    try {
      await onUpvote(comment.id)
      // The like state will be updated when comments are refreshed
    } catch (error) {
      console.error("Error upvoting comment:", error)
    }
  }

  const canReply = depth < maxDepth && currentUser
  // Check if this comment is liked by the current user
  const isLiked = comment.user_likes?.some(like => like.user_id === currentUser?.id) || false

  return (
    <div className={`${depth > 0 ? 'ml-8 border-l-2 border-orange-200 pl-4 bg-orange-50/30 rounded-r-lg' : ''}`}>
      {depth > 0 && (
        <div className="flex items-center mb-2">
          <span className="text-xs text-orange-500 mr-2">↳</span>
          <span className="text-xs text-orange-600 font-medium">Reply</span>
        </div>
      )}
      <div className="flex space-x-3 mb-3">
        <UserAvatar 
          user={{ username: comment.user?.username || comment.author || comment.username, profile_picture: comment.user?.profile_picture }} 
          size="sm" 
          className="flex-shrink-0" 
        />
        <div className="flex-1">
          <div className="bg-gray-50 rounded-2xl p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-sm text-gray-900">
                  {comment.user?.username || comment.author || comment.username}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(comment.created_at).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              
              {/* Upvote Button */}
              <button
                onClick={handleUpvote}
                disabled={!currentUser}
                className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs transition-colors ${
                  isLiked 
                    ? 'text-orange-600 bg-orange-50' 
                    : 'text-gray-500 hover:text-orange-600 hover:bg-orange-50'
                } ${!currentUser ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <Heart className={`h-3 w-3 ${isLiked ? 'fill-current ' : ''}`} />
                <span>{comment.upvotes_count || 0}</span>
              </button>
            </div>
            
            <p className="text-gray-700 text-sm leading-relaxed mb-3">
              {comment.content && comment.content.startsWith('[REPLY_TO:') 
                ? comment.content.replace(/^\[REPLY_TO:[^\]]+\]\s*/, '') 
                : comment.content
              }
            </p>
            
            {/* Show reply indicator if this is a reply */}
            {(comment.parent_comment_id || comment.temp_parent_id || 
              (comment.content && comment.content.startsWith('[REPLY_TO:'))) && (
              <div className="text-xs text-orange-500 mb-2">
                ↳ Reply to comment
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="flex items-center space-x-4">
              {canReply && (
                <button
                  onClick={() => setShowReplyForm(!showReplyForm)}
                  className="flex items-center space-x-1 text-xs text-gray-500 hover:text-orange-600 transition-colors"
                >
                  <Reply className="h-3 w-3" />
                  <span>Reply</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reply Form */}
      {showReplyForm && (
        <div className={`${depth > 0 ? 'ml-8' : 'ml-9'} mb-4`}>
          <div className="flex gap-3">
            <UserAvatar user={currentUser} size="sm" className="flex-shrink-0" />
            <div className="flex-1">
              <input
                placeholder={`Reply to ${comment.user?.username || comment.author || comment.username}...`}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleReply()}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
              />
              <div className="flex justify-end mt-2 space-x-2">
                <button
                  onClick={() => setShowReplyForm(false)}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReply}
                  disabled={!replyText.trim() || isSubmitting}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded-full text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? 'Posting...' : 'Reply'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Nested Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="space-y-3">
          {comment.replies.map((reply) => (
            <Comment
              key={reply.id}
              comment={reply}
              currentUser={currentUser}
              onReply={onReply}
              onUpvote={onUpvote}
              maxDepth={maxDepth}
            />
          ))}
        </div>
      )}
    </div>
  )
} 