"use client"

import { useState, useMemo } from "react"
import { Search, MessageCircle, CheckCircle, Clock, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Mock data for Easter eggs
const mockEasterEggs = [
  {
    id: "1",
    title: "13 Hidden in Folklore Album Art",
    description: "The number 13 appears subtly hidden in the Folklore album artwork, continuing Taylor's tradition of incorporating her lucky number.",
    album: "folklore",
    media_type: "Album Art",
    clue_type: "Visual",
    status: "confirmed",
    image_url: "/folklore-cardigan-buttons.png",
    upvotes_count: 42,
    comments_count: 8,
    created_at: "2024-01-15T10:00:00Z",
    tags: ["13", "folklore", "visual", "album art"]
  },
  {
    id: "2",
    title: "Purple Dress in Midnight Rain",
    description: "The purple dress mentioned in 'Midnight Rain' references a specific outfit from the 1989 era, creating a connection between albums.",
    album: "Midnights",
    media_type: "Music Video",
    clue_type: "Color",
    status: "theory",
    image_url: "/celebrity-purple-dress.png",
    upvotes_count: 28,
    comments_count: 5,
    created_at: "2024-01-10T14:30:00Z",
    tags: ["purple", "midnights", "1989", "fashion"]
  },
  {
    id: "3",
    title: "Snake Imagery in Reputation",
    description: "The snake imagery throughout the Reputation era represents transformation and rebirth, with hidden snake symbols in music videos.",
    album: "reputation",
    media_type: "Music Video",
    clue_type: "Symbol",
    status: "confirmed",
    image_url: "/snake-jewelry-accessories.png",
    upvotes_count: 67,
    comments_count: 12,
    created_at: "2024-01-05T09:15:00Z",
    tags: ["snake", "reputation", "symbol", "transformation"]
  },
  {
    id: "4",
    title: "Butterfly Hair Clips in Lover",
    description: "Butterfly hair clips appear in the 'Lover' music video, symbolizing freedom and the metamorphosis of love.",
    album: "Lover",
    media_type: "Music Video",
    clue_type: "Visual",
    status: "confirmed",
    image_url: "/butterfly-hair-clips-lover-inspired.png",
    upvotes_count: 35,
    comments_count: 6,
    created_at: "2024-01-08T16:45:00Z",
    tags: ["butterfly", "lover", "visual", "freedom"]
  },
  {
    id: "5",
    title: "Clock References in Midnights",
    description: "Multiple clock references throughout the Midnights album, with specific times mentioned in lyrics corresponding to significant moments.",
    album: "Midnights",
    media_type: "Music",
    clue_type: "Time",
    status: "theory",
    image_url: "/midnight-clock-taylor-swift.png",
    upvotes_count: 53,
    comments_count: 9,
    created_at: "2024-01-12T11:20:00Z",
    tags: ["clock", "midnights", "time", "lyrics"]
  },
  {
    id: "6",
    title: "Hand with Number Thirteen",
    description: "The recurring hand gesture showing the number 13 appears in various performances and music videos.",
    album: "All Albums",
    media_type: "Performance",
    clue_type: "Number",
    status: "confirmed",
    image_url: "/hand-with-number-thirteen.png",
    upvotes_count: 89,
    comments_count: 15,
    created_at: "2024-01-03T13:10:00Z",
    tags: ["13", "hand gesture", "performance", "number"]
  }
]

const albums = [
  "All Albums",
  "Fearless",
  "Speak Now",
  "Red",
  "1989",
  "reputation",
  "Lover",
  "folklore",
  "evermore",
  "Midnights",
  "TTPD",
]

const mediaTypes = ["All Types", "Music Video", "Performance", "Fashion", "Photo", "Social Media", "Interview", "Album Art", "Music"]
const clueTypes = ["All Clues", "Visual", "Color", "Hidden Message", "Number", "Symbol", "Time", "Lyric"]

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedAlbum, setSelectedAlbum] = useState("All Albums")
  const [selectedMediaType, setSelectedMediaType] = useState("All Types")
  const [selectedClueType, setSelectedClueType] = useState("All Clues")
  const [sortBy, setSortBy] = useState("newest")
  const [selectedEgg, setSelectedEgg] = useState<any>(null)

  const filteredAndSortedEasterEggs = useMemo(() => {
    const filtered = mockEasterEggs.filter((egg) => {
      const matchesSearch =
        egg.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        egg.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        egg.tags?.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesAlbum = selectedAlbum === "All Albums" || egg.album === selectedAlbum
      const matchesMediaType = selectedMediaType === "All Types" || egg.media_type === selectedMediaType
      const matchesClueType = selectedClueType === "All Clues" || egg.clue_type === selectedClueType

      return matchesSearch && matchesAlbum && matchesMediaType && matchesClueType
    })

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "votes":
          return (b.upvotes_count || 0) - (a.upvotes_count || 0)
        case "newest":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case "oldest":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        default:
          return 0
      }
    })
  }, [searchQuery, selectedAlbum, selectedMediaType, selectedClueType, sortBy])

  const handleEggClick = (egg: any) => {
    setSelectedEgg(egg)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Swift Secrets
            </h1>
            <p className="text-sm text-gray-600">Discover Taylor Swift's hidden Easter eggs</p>
          </div>

          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search Easter eggs, theories, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/70 border-purple-200 focus:border-purple-400"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            <Select value={selectedAlbum} onValueChange={setSelectedAlbum}>
              <SelectTrigger className="w-[140px] bg-white/70 border-purple-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {albums.map((album) => (
                  <SelectItem key={album} value={album}>
                    {album}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedMediaType} onValueChange={setSelectedMediaType}>
              <SelectTrigger className="w-[130px] bg-white/70 border-purple-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {mediaTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedClueType} onValueChange={setSelectedClueType}>
              <SelectTrigger className="w-[120px] bg-white/70 border-purple-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {clueTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[120px] bg-white/70 border-purple-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
                <SelectItem value="votes">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Top Voted
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedEasterEggs.map((egg) => (
            <Card
              key={egg.id}
              className="group hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm border-purple-100 hover:border-purple-300 cursor-pointer"
              onClick={() => handleEggClick(egg)}
            >
              <div className="relative overflow-hidden rounded-t-lg">
                <img
                  src={egg.image_url || "/placeholder.svg"}
                  alt={egg.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 right-2 flex gap-2">
                  {egg.status === "confirmed" ? (
                    <Badge className="bg-green-500 hover:bg-green-600">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Confirmed
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
                      <Clock className="h-3 w-3 mr-1" />
                      Theory
                    </Badge>
                  )}
                </div>
              </div>

              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-purple-700 transition-colors">
                    {egg.title}
                  </h3>
                </div>

                <p className="text-sm text-gray-600 mb-3 line-clamp-3">{egg.description}</p>

                <div className="flex flex-wrap gap-1 mb-3">
                  {egg.album && (
                    <Badge variant="outline" className="text-xs border-purple-200 text-purple-700">
                      {egg.album}
                    </Badge>
                  )}
                  {egg.media_type && (
                    <Badge variant="outline" className="text-xs border-pink-200 text-pink-700">
                      {egg.media_type}
                    </Badge>
                  )}
                  {egg.clue_type && (
                    <Badge variant="outline" className="text-xs border-yellow-200 text-yellow-700">
                      {egg.clue_type}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                  <div className="flex items-center gap-1 text-gray-500">
                    <MessageCircle className="h-4 w-4" />
                    <span>{egg.comments_count || 0}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-500">
                    <TrendingUp className="h-4 w-4" />
                    <span>{egg.upvotes_count || 0}</span>
                  </div>
                </div>

                <div className="text-xs text-gray-500">
                  Discovered • {new Date(egg.created_at).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredAndSortedEasterEggs.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Easter eggs found</h3>
            <p className="text-gray-500">Try adjusting your search or filters to find more clues.</p>
          </div>
        )}
      </main>

      {/* Detailed Easter egg modal */}
      {selectedEgg && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">{selectedEgg.title}</h2>
              <Button variant="ghost" size="sm" onClick={() => setSelectedEgg(null)} className="hover:bg-gray-100">
                ✕
              </Button>
            </div>

            <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="p-6">
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <img
                      src={selectedEgg.image_url || "/placeholder.svg"}
                      alt={selectedEgg.title}
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  </div>

                  <div>
                    <p className="text-gray-700 mb-4">{selectedEgg.description}</p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {selectedEgg.album && (
                        <Badge variant="outline" className="border-purple-200 text-purple-700">
                          {selectedEgg.album}
                        </Badge>
                      )}
                      {selectedEgg.media_type && (
                        <Badge variant="outline" className="border-pink-200 text-pink-700">
                          {selectedEgg.media_type}
                        </Badge>
                      )}
                      {selectedEgg.clue_type && (
                        <Badge variant="outline" className="border-yellow-200 text-yellow-700">
                          {selectedEgg.clue_type}
                        </Badge>
                      )}
                      {selectedEgg.status === "confirmed" ? (
                        <Badge className="bg-green-500">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Confirmed
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                          <Clock className="h-3 w-3 mr-1" />
                          Theory
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <TrendingUp className="h-4 w-4" />
                        {selectedEgg.upvotes_count || 0} discoveries
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <MessageCircle className="h-4 w-4" />
                        {selectedEgg.comments_count || 0} discussions
                      </div>
                    </div>

                    <div className="text-sm text-gray-500">
                      Discovered • {new Date(selectedEgg.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Tags Section */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedEgg.tags?.map((tag: string) => (
                      <Badge key={tag} variant="outline" className="border-gray-200 text-gray-700">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
