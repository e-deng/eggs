import React from "react"

export default function AuthNotice({ onOpenAuthModal }) {
  return (
    <div className="bg-blue-50 border-b border-blue-200">
      <div className="max-w-2xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <p className="text-sm text-blue-800">
            <strong>👋 Welcome!</strong> You can browse all Easter eggs, but sign in to post, comment, and like!
          </p>
          <button
            onClick={() => onOpenAuthModal("login")}
            className="text-blue-600 hover:text-blue-700 font-medium text-sm underline"
          >
            Sign In / Sign Up
          </button>
        </div>
      </div>
    </div>
  )
} 