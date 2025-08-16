import React from "react"
import { generateTaylorSwiftAvatar, getAvatarClasses } from '../utils/taylorSwiftAvatars'

export default function UserAvatar({ user, size = "sm", className = "" }) {
  const sizeClasses = {
    sm: "w-10 h-10",
    md: "w-10 h-10", 
    lg: "w-12 h-12",
    xl: "w-16 h-16"
  }

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
    xl: "text-3xl"
  }

  if (!user) {
    const defaultAvatar = generateTaylorSwiftAvatar(null)
    return (
      <div className={`${sizeClasses[size]} ${getAvatarClasses(defaultAvatar)} ${className}`}>
        <span className={`${textSizes[size]} text-white font-bold`}>{defaultAvatar.emoji}</span>
      </div>
    )
  }

  // If user has a profile picture, display it
  if (user.profile_picture) {
    return (
      <div className="relative min-w-0">
        <img
          src={user.profile_picture}
          alt={`${user.username}'s profile`}
          className={`${sizeClasses[size]} rounded-full object-cover aspect-square flex-shrink-0 ${className}`}
          onError={(e) => {
            // Fallback to Taylor Swift avatar if image fails to load
            e.target.style.display = 'none'
            e.target.nextSibling.style.display = 'flex'
          }}
        />
        {/* Hidden fallback avatar for when image fails to load */}
        <div className={`${sizeClasses[size]} ${getAvatarClasses(generateTaylorSwiftAvatar(user?.id))} ${className} absolute inset-0 flex-shrink-0`} style={{ display: 'none' }}>
          <span className={`${textSizes[size]} text-white font-bold`}>{generateTaylorSwiftAvatar(user?.id).emoji}</span>
        </div>
      </div>
    )
  }

  // Generate Taylor Swift themed avatar based on user ID
  const avatar = generateTaylorSwiftAvatar(user?.id)
  
  return (
    <div className={`${sizeClasses[size]} ${getAvatarClasses(avatar)} ${className}`}>
      <span className={`${textSizes[size]} text-white font-bold`}>{avatar.emoji}</span>
    </div>
  )
} 