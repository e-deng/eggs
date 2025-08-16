import React from "react"

export default function Header({ 
  user, 
  onLogout, 
  onOpenAuthModal
}) {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo and Title */}
          <div className="flex items-center">
            <div className="flex-shrink-0 mr-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">🥚</span>
              </div>
            </div>
            <h1 className="text-xl font-bold text-gray-900">
              TS Easter Eggs
            </h1>
          </div>

          {/* Right side - Auth */}
          <div className="flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600">
                  <span className="font-medium text-gray-900">
                    {user.username}
                  </span>
                </span>

                <button
                  onClick={onLogout}
                  className="text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors"
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
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
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