import React from "react"
import { DatabaseZap } from "lucide-react"
import { DATABASE_UNAVAILABLE_MESSAGE } from "../utils/databaseStatus"

export default function DatabaseUnavailableNotice({ onRetry }) {
  return (
    <div className="text-center py-16 px-4">
      {/* Icon */}
      <div className="mx-auto w-16 h-16 bg-gradient-to-br from-orange-100 to-pink-100 rounded-full flex items-center justify-center mb-6">
        <DatabaseZap className="h-8 w-8 text-orange-600" />
      </div>

      {/* Message */}
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        Temporarily Unavailable
      </h3>
      <p className="text-gray-600 mb-8 max-w-md mx-auto">
        {DATABASE_UNAVAILABLE_MESSAGE}
      </p>

      {/* Action Button */}
      <button
        onClick={onRetry}
        className="flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-medium transition-colors mx-auto"
      >
        Try Again
      </button>
    </div>
  )
}
