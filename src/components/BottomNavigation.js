import React from "react"
import { Home, Search, Plus, User, HeartIcon } from "lucide-react"

export default function BottomNavigation({ 
  activeTab, 
  onTabChange, 
  onOpenAddEggModal,
  user 
}) {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
      <div className="flex items-center justify-center py-3 px-4">
        <div className="flex items-center justify-between w-full max-w-sm">
          {/* Home Tab */}
          <button
            onClick={() => onTabChange("home")}
            className={`flex flex-col items-center justify-center w-16 h-16 rounded-lg transition-colors ${
              activeTab === "home"
                ? "text-orange-600 bg-orange-50"
                : "text-gray-500 hover:text-orange-600"
            }`}
          >
            <Home className="h-5 w-5 mb-1" />
            <span className="text-xs font-medium text-center leading-tight">Home</span>
          </button>

          {/* Search Tab */}
          <button
            onClick={() => onTabChange("search")}
            className={`flex flex-col items-center justify-center w-16 h-16 rounded-lg transition-colors ${
              activeTab === "search"
                ? "text-orange-600 bg-orange-50"
                : "text-gray-500 hover:text-orange-600"
            }`}
          >
            <Search className="h-5 w-5 mb-1" />
            <span className="text-xs font-medium text-center leading-tight">Search</span>
          </button>

          {/* Add Post Button */}
          <button
            onClick={onOpenAddEggModal}
            disabled={!user}
            className="flex flex-col items-center justify-center w-16 h-16 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-green-500 rounded-full flex items-center justify-center mb-1">
              <Plus className="h-4 w-4 text-white" />
            </div>
            <span className="text-xs font-medium text-gray-500 text-center leading-tight">Post</span>
          </button>

          {/* Profile Tab */}
          <button
            onClick={() => onTabChange("profile")}
            className={`flex flex-col items-center justify-center w-16 h-16 rounded-lg transition-colors ${
              activeTab === "profile"
                ? "text-orange-600 bg-orange-50"
                : "text-gray-500 hover:text-orange-600"
            }`}
          >
            <User className="h-5 w-5 mb-1" />
            <span className="text-xs font-medium text-center leading-tight">My Posts</span>
          </button>

          {/* Favorites Tab */}
          <button
            onClick={() => onTabChange("favorites")}
            className={`flex flex-col items-center justify-center w-16 h-16 rounded-lg transition-colors ${
              activeTab === "favorites"
                ? "text-orange-600 bg-orange-50"
                : "text-gray-500 hover:text-orange-600"
            }`}
          >
            <HeartIcon className="h-5 w-5 mb-1" />
            <span className="text-xs font-medium text-center leading-tight">Favorites</span>
          </button>
        </div>
      </div>
    </div>
  )
} 