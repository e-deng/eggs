import React from "react"

export default function Header({ 
  user, 
  onLogout, 
  onOpenAuthModal,
  onOpenUserProfile
}) {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Left side - Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">🥚</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">
              TS Easter Eggs
            </h1>
          </div>

          {/* Right side - Auth */}
          <div className="flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3">
                <button
                  onClick={onOpenUserProfile}
                  className="md:hidden text-sm text-gray-600 hover:text-orange-600 transition-colors"
                >
                  <span className="font-medium text-orange-600">
                    {user.username}
                  </span>
                </button>
                
                <span className="hidden md:inline text-sm text-gray-600">
                  <span className="font-medium text-orange-600">
                    {user.username}
                  </span>
                </span>

                <button
                  onClick={onLogout}
                  className="hidden md:inline text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => onOpenAuthModal("login")}
                  className="text-gray-700 hover:text-gray-900 px-4 py-2 text-sm font-medium transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onOpenAuthModal("register")}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
} 