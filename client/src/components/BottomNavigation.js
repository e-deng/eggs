import React from "react"
import { Home, Plus, User, Search } from "lucide-react"

export default function BottomNavigation({ 
  activeTab, 
  onTabChange, 
  onOpenAddEggModal,
  user 
}) {
  if (!user) return null

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex items-center justify-around py-2">
        {/* Home/All Eggs Tab */}
        <button
          onClick={() => onTabChange('home')}
          className={`flex flex-col items-center py-2 px-4 rounded-lg transition-colors ${
            activeTab === 'home' 
              ? 'text-purple-600 bg-purple-50' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Home className={`h-6 w-6 ${activeTab === 'home' ? 'text-purple-600' : ''}`} />
          <span className="text-xs mt-1">All Eggs</span>
        </button>

        {/* Search Tab */}
        <button
          onClick={() => onTabChange('search')}
          className={`flex flex-col items-center py-2 px-4 rounded-lg transition-colors ${
            activeTab === 'search' 
              ? 'text-purple-600 bg-purple-50' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Search className={`h-6 w-6 ${activeTab === 'search' ? 'text-purple-600' : ''}`} />
          <span className="text-xs mt-1">Search</span>
        </button>

        {/* Post Tab */}
        <button
          onClick={onOpenAddEggModal}
          className="flex flex-col items-center py-2 px-4 rounded-lg transition-colors text-purple-600 hover:bg-purple-50"
        >
          <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
            <Plus className="h-4 w-4 text-white" />
          </div>
          <span className="text-xs mt-1">Post</span>
        </button>

        {/* Profile/My Posts Tab */}
        <button
          onClick={() => onTabChange('profile')}
          className={`flex flex-col items-center py-2 px-4 rounded-lg transition-colors ${
            activeTab === 'profile' 
              ? 'text-purple-600 bg-purple-50' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <User className={`h-6 w-6 ${activeTab === 'profile' ? 'text-purple-600' : ''}`} />
          <span className="text-xs mt-1">My Posts</span>
        </button>
      </div>
    </div>
  )
} 