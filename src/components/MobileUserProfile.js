import React from "react"
import { X, User, LogOut } from "lucide-react"

export default function MobileUserProfile({ isOpen, onClose, user, onLogout, onOpenUserSettings }) {
  if (!isOpen) return null

  return (
    <div className="md:hidden fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Profile</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">{user.username}</h3>
              <p className="text-sm text-gray-500">Member since {new Date(user.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 space-y-2">
         
          
          <button
            onClick={onLogout}
            className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
          >
            <LogOut className="h-5 w-5 text-gray-500" />
            <span className="text-gray-700">Logout</span>
          </button>
        </div>

        {/* Footer */}
        <div className="mt-auto border-t border-gray-200 p-4 bg-gray-50">
          <div className="text-center space-y-2">
            <p className="text-xs text-gray-400">
              © 2025 TS Easter Eggs. Fan-made website.
            </p>
            <div className="flex justify-center space-x-3 text-xs text-gray-400">
              <button className="hover:text-orange-500 transition-colors">Privacy</button>
              <button className="hover:text-orange-500 transition-colors">Terms</button>
              <a href="https://forms.gle/6zFMZciLH7jPMFMUA" target="_blank" rel="noopener noreferrer" className="hover:text-orange-500 transition-colors">Feedback</a>
            </div>
            <p className="text-xs text-gray-300 leading-tight">
              Not affiliated with Taylor Swift. Fan-created content only.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 