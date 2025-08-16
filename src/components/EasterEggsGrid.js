import React from "react"
import { Search } from "lucide-react"
import EasterEggCard from "./EasterEggCard"

export default function EasterEggsGrid({ 
  easterEggs, 
  userLikes, 
  onEggClick, 
  onVote, 
  getAlbumColors,
  loading,
  currentUser,
  onEditEgg,
  activeTab
}) {
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Easter eggs...</p>
        </div>
      </div>
    )
  }

  if (easterEggs.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <Search className="h-16 w-16 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Easter eggs found</h3>
        <p className="text-gray-500">Try adjusting your search or filters</p>
      </div>
    )
  }

  return (
    <div className="space-y-0">
      {easterEggs.map((egg) => (
        <EasterEggCard
          key={egg.id}
          egg={egg}
          userLikes={userLikes}
          onEggClick={onEggClick}
          onVote={onVote}
          getAlbumColors={getAlbumColors}
          currentUser={currentUser}
          onEditEgg={onEditEgg}
          activeTab={activeTab}
        />
      ))}
    </div>
  )
} 