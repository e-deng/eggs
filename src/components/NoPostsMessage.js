import React from "react"
import { Plus, MessageCircle } from "lucide-react"

export default function NoPostsMessage({ onOpenAddEggModal }) {
  return (
    <div className="text-center py-16 px-4">
      {/* Icon */}
      <div className="mx-auto w-16 h-16 bg-gradient-to-br from-orange-100 to-pink-100 rounded-full flex items-center justify-center mb-6">
        <MessageCircle className="h-8 w-8 text-orange-600" />
      </div>
      
      {/* Message */}
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        You have no posts!
      </h3>
      <p className="text-gray-600 mb-8 max-w-md mx-auto">
        Start sharing your Easter egg discoveries with the community! Your first post could inspire other hunters.
      </p>
      
      {/* Action Button */}
      <button
        onClick={onOpenAddEggModal}
        className="flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-medium transition-colors mx-auto"
      >
        <Plus className="h-5 w-5" />
        Start Posting
      </button>
    </div>
  )
} 