import React from "react"
import { Home, Plus, User, Search } from "lucide-react"

export default function TopNavigation({ 
  activeTab, 
  onTabChange, 
  onOpenAddEggModal,
  user 
}) {
  if (!user) return null

  return (
    <div className="hidden md:block border-b border-gray-200 bg-white">
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex items-center justify-center space-x-8">
          {/* Home/All Eggs Tab */}
          <button
            onClick={() => onTabChange('home')}
            className={`flex items-center space-x-2 py-4 px-2 border-b-2 transition-colors ${
              activeTab === 'home' 
                ? 'border-purple-600 text-purple-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Home className="h-5 w-5" />
            <span className="font-medium">All Eggs</span>
          </button>

          {/* Search Tab */}
          <button
            onClick={() => onTabChange('search')}
            className={`flex items-center space-x-2 py-4 px-2 border-b-2 transition-colors ${
              activeTab === 'search' 
                ? 'border-purple-600 text-purple-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Search className="h-5 w-5" />
            <span className="font-medium">Search</span>
          </button>

          {/* Post Tab */}
          <button
            onClick={onOpenAddEggModal}
            className="flex items-center space-x-2 py-4 px-2 border-b-2 border-transparent text-purple-600 hover:text-purple-700 hover:border-purple-300 transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span className="font-medium">Post</span>
          </button>

          {/* Profile/My Posts Tab */}
          <button
            onClick={() => onTabChange('profile')}
            className={`flex items-center space-x-2 py-4 px-2 border-b-2 transition-colors ${
              activeTab === 'profile' 
                ? 'border-purple-600 text-purple-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <User className="h-5 w-5" />
            <span className="font-medium">My Posts</span>
          </button>
        </div>
      </div>
    </div>
  )
} 