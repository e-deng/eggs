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
      <div className="flex items-center justify-around py-2">
        {/* Home Tab */}
        <button
          onClick={() => onTabChange("home")}
          className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-colors ${
            activeTab === "home"
              ? "text-orange-600 bg-orange-50"
              : "text-gray-500 hover:text-orange-600"
          }`}
        >
          <Home className="h-5 w-5" />
          <span className="text-xs font-medium">Home</span>
        </button>

        {/* Search Tab */}
        <button
          onClick={() => onTabChange("search")}
          className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-colors ${
            activeTab === "search"
              ? "text-orange-600 bg-orange-50"
              : "text-gray-500 hover:text-orange-600"
          }`}
        >
          <Search className="h-5 w-5" />
          <span className="text-xs font-medium">Search</span>
        </button>

        {/* Add Post Button */}
        <button
          onClick={onOpenAddEggModal}
          disabled={!user}
          className="flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-green-500 rounded-full flex items-center justify-center -mt-2">
            <Plus className="h-5 w-5 text-white" />
          </div>
          <span className="text-xs font-medium text-gray-500">Post</span>
        </button>

        {/* Profile Tab */}
        <button
          onClick={() => onTabChange("profile")}
          className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-colors ${
            activeTab === "profile"
              ? "text-orange-600 bg-orange-50"
              : "text-gray-500 hover:text-orange-600"
          }`}
        >
          <User className="h-5 w-5" />
          <span className="text-xs font-medium">My Posts</span>
        </button>

        {/* Favorites Tab */}
        <button
          onClick={() => onTabChange("favorites")}
          className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-colors ${
            activeTab === "favorites"
              ? "text-orange-600 bg-orange-50"
              : "text-gray-500 hover:text-orange-600"
          }`}
        >
          <HeartIcon className="h-5 w-5" />
          <span className="text-xs font-medium">Favorites</span>
        </button>
      </div>
    </div>
  )
} 