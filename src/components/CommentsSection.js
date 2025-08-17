import React from "react"
import { MessageCircle } from "lucide-react"
import UserAvatar from "./UserAvatar"
import Comment from "./Comment"

export default function CommentsSection({ 
  comments, 
  newComment, 
  setNewComment, 
  onAddComment,
  currentUser,
  onReply,
  onUpvote,
  onDelete
}) {
  return (
    <div className="border-t border-gray-200 pt-4">
      <h3 className="text-lg font-semibold mb-4 text-gray-900">Comments ({comments.length})</h3>
      


      {/* Add Comment Form */}
      <div className="mb-6">
        <div className="flex gap-3">
          <UserAvatar user={currentUser} size="sm" className="flex-shrink-0" />
          <div className="flex-1">
            <input
              placeholder="Share your thoughts on this Easter egg..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && onAddComment()}
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
            />
            <div className="flex justify-end mt-2">
              <button
                onClick={onAddComment}
                disabled={!newComment.trim()}
                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-full text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Comment
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.map((comment) => (
          <Comment
            key={comment.id}
            comment={comment}
            currentUser={currentUser}
            onReply={onReply}
            onUpvote={onUpvote}
            onDelete={onDelete}
          />
        ))}

        {comments.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No comments yet. Be the first to share your thoughts!</p>
          </div>
        )}
      </div>
    </div>
  )
} 