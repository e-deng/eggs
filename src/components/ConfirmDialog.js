import React from "react"
import { X, AlertTriangle } from "lucide-react"

export default function ConfirmDialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = "Delete", 
  cancelText = "Cancel",
  type = "danger" 
}) {
  if (!isOpen) return null

  const getColors = () => {
    switch (type) {
      case "danger":
        return {
          bg: "bg-red-50",
          border: "border-red-200",
          button: "bg-red-600 hover:bg-red-700",
          icon: "text-red-600"
        }
      case "warning":
        return {
          bg: "bg-yellow-50",
          border: "border-yellow-200",
          button: "bg-yellow-600 hover:bg-yellow-700",
          icon: "text-yellow-600"
        }
      default:
        return {
          bg: "bg-blue-50",
          border: "border-blue-200",
          button: "bg-blue-600 hover:bg-blue-700",
          icon: "text-blue-600"
        }
    }
  }

  const colors = getColors()

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-lg w-full max-w-md ${colors.bg} ${colors.border} border-2`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <AlertTriangle className={`h-6 w-6 ${colors.icon}`} />
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="text-gray-700 mb-6">{message}</p>
          
          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm()
                onClose()
              }}
              className={`px-4 py-2 text-white rounded-lg font-medium transition-colors ${colors.button}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 