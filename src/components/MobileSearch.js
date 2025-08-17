import React from "react"
import { Search } from "lucide-react"

export default function MobileSearch({ 
  searchQuery, 
  setSearchQuery, 
  selectedAlbum, 
  setSelectedAlbum,
  sortBy,
  setSortBy 
}) {
  const albums = ["All Albums", "Taylor Swift", "Fearless", "Speak Now", "Red", "1989", "Reputation", "Lover", "Folklore", "Evermore", "Midnights", "TTPD", "The Life of a Showgirl"]

  return (
    <div className="md:hidden bg-white border-b border-gray-200 px-4 py-4">
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search Easter eggs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
          />
        </div>

        {/* Album Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Album
          </label>
          <select
            value={selectedAlbum}
            onChange={(e) => setSelectedAlbum(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
          >
            {albums.map((album) => (
              <option key={album} value={album}>
                {album}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Options */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sort by
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
          >
            <option value="date">Date</option>
            <option value="likes">Most Liked</option>
            <option value="comments">Most Commented</option>
          </select>
        </div>
      </div>
    </div>
  )
} 