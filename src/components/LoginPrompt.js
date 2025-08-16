import React from "react"
import { LogIn, UserPlus, Heart } from "lucide-react"

export default function LoginPrompt({ 
  message = "Please log in or create an account to access this feature",
  onOpenAuthModal,
  showSignUp = true 
}) {
  return (
    <div className="text-center py-16 px-4">
      {/* Icon */}
      <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mb-6">
        <Heart className="h-8 w-8 text-purple-600" />
      </div>
      
      {/* Message */}
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {message}
      </h3>
      <p className="text-gray-600 mb-8 max-w-md mx-auto">
        Join our community of Easter egg hunters to share your discoveries and connect with other fans!
      </p>
      
      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={() => onOpenAuthModal("login")}
          className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          <LogIn className="h-5 w-5" />
          Sign In
        </button>
        
        {showSignUp && (
          <button
            onClick={() => onOpenAuthModal("register")}
            className="flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-purple-600 border-2 border-purple-600 px-6 py-3 rounded-lg font-medium transition-colors"
          >
            <UserPlus className="h-5 w-5" />
            Create Account
          </button>
        )}
      </div>
    </div>
  )
} 