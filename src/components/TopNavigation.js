import React from "react"
import { Home, Search, Plus, User, Heart } from "lucide-react"

export default function TopNavigation({ 
  activeTab,
  onTabChange,
  onOpenAddEggModal,
  user,
  searchQuery, 
  setSearchQuery, 
  selectedAlbum, 
  setSelectedAlbum,
  sortBy,
  setSortBy
}) {
  const albums = ["All Albums", "Taylor Swift", "Fearless", "Speak Now", "Red", "1989", "Reputation", "Lover", "Folklore", "Evermore", "Midnights", "TTPD", "The Life of a Showgirl"]

  return (
    <div className="hidden md:block border-b border-gray-200 bg-white">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-center space-x-8">
          {/* Home Tab */}
          <button
            onClick={() => onTabChange("home")}
            className={`flex items-center space-x-2 py-4 px-2 border-b-2 transition-colors ${
              activeTab === "home" 
                ? "border-orange-600 text-orange-600" 
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <Home className="h-5 w-5" />
            <span className="font-medium">Home</span>
          </button>

          {/* Search Tab */}
          <button
            onClick={() => onTabChange("search")}
            className={`flex items-center space-x-2 py-4 px-2 border-b-2 transition-colors ${
              activeTab === "search" 
                ? "border-orange-600 text-orange-600" 
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <Search className="h-5 w-5" />
            <span className="font-medium">Search</span>
          </button>

          {/* Post Tab */}
          <button
            onClick={user ? onOpenAddEggModal : () => onTabChange("post")}
            className={`flex items-center space-x-2 py-4 px-2 border-b-2 border-transparent transition-colors ${
              user 
                ? "text-orange-600 hover:text-orange-700 hover:border-orange-300" 
                : "text-gray-400 cursor-not-allowed"
            }`}
          >
            <Plus className="h-5 w-5" />
            <span className="font-medium">Post</span>
          </button>

          {/* Profile Tab */}
          <button
            onClick={() => onTabChange("profile")}
            className={`flex items-center space-x-2 py-4 px-2 border-b-2 transition-colors ${
              activeTab === "profile" 
                ? "border-orange-600 text-orange-600" 
                : user 
                  ? "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  : "border-transparent text-gray-400 cursor-not-allowed"
            }`}
          >
            <User className="h-5 w-5" />
            <span className="font-medium">My Posts</span>
          </button>

          {/* Favorites Tab */}
          <button
            onClick={() => onTabChange("favorites")}
            className={`flex items-center space-x-2 py-4 px-2 border-b-2 transition-colors ${
              activeTab === "favorites" 
                ? "border-orange-600 text-orange-600" 
                : user 
                  ? "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  : "border-transparent text-gray-400 cursor-not-allowed"
            }`}
          >
            <Heart className="h-5 w-5" />
            <span className="font-medium">Favorites</span>
          </button>
        </div>

        {/* Search and Filters - Only show on search tab */}
        {activeTab === "search" && (
          <div className="py-4 border-t border-gray-100">
            <div className="flex flex-wrap items-center gap-4">
              {/* Search Bar */}
              <div className="flex-1 min-w-64">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search Easter eggs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Album Filter */}
              <div className="flex items-center space-x-2">
                <select
                  value={selectedAlbum}
                  onChange={(e) => setSelectedAlbum(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                >
                  {albums.map((album) => (
                    <option key={album} value={album}>
                      {album}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort Options */}
              <div className="flex items-center space-x-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                >
                  <option value="date">Date</option>
                  <option value="likes">Most Liked</option>
                  <option value="comments">Most Commented</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 