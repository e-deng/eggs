import React from "react"
import { Search } from "lucide-react"
import { albums } from "../utils/albumColors"

export default function SearchFilters({ 
  searchQuery, 
  setSearchQuery, 
  selectedAlbum, 
  setSelectedAlbum, 
  sortBy, 
  setSortBy,
  getAlbumColors,
  activeTab,
  filteredAndSortedEasterEggs
}) {
  // Only show search filters when on search tab
  if (activeTab !== 'search') {
    return (
      <div className="border-b border-gray-200 pb-4 mb-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">
            {activeTab === 'home' ? 'All Easter Eggs' : 
             activeTab === 'profile' ? 'My Easter Eggs' : 'Easter Eggs'}
          </h2>
        </div>
      </div>
    )
  }

  return (
    <div className="border-b border-gray-200 pb-4 mb-6">
      <div className="flex flex-col space-y-4">
        {/* Tab Title */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Search Easter Eggs</h2>
        </div>
        
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            placeholder="Search by title, description, or album..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-11 w-full bg-gray-50 border-0 rounded-full text-base focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all"
          />
        </div>
        
        {/* Filters Row */}
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            {/* Album Filter */}
            <select 
              value={selectedAlbum} 
              onChange={(e) => setSelectedAlbum(e.target.value)}
              className="px-4 py-2 bg-gray-50 border-0 rounded-full text-sm text-gray-700 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all"
            >
              {albums.map((album) => (
                <option key={album} value={album}>
                  {album}
                </option>
              ))}
            </select>
            
            {/* Sort Filter */}
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 bg-gray-50 border-0 rounded-full text-sm text-gray-700 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all"
            >
              <option value="date">Latest</option>
              <option value="upvotes">Most Liked</option>
              <option value="comments">Most Discussed</option>
            </select>
          </div>
          
          {/* Results count */}
          <span className="text-sm text-gray-500">
            {searchQuery.trim() || selectedAlbum !== "All Albums" ? 
              `${filteredAndSortedEasterEggs?.length || 0} results` : 
              "No search active"
            }
          </span>
        </div>
        
        {/* Search Message */}
        {!searchQuery.trim() && selectedAlbum === "All Albums" && (
          <div className="text-center py-8">
            <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Start typing to search Easter eggs</p>
            <p className="text-gray-400 text-sm mt-2">Search by title, description, or filter by album</p>
          </div>
        )}
      </div>
    </div>
  )
} 