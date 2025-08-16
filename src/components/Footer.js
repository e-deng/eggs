import React from "react"

export default function Footer() {
  return (
    <footer className="hidden md:block bg-gray-50 border-t border-gray-200 mt-16">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
          <p className="text-xs text-gray-400">
            © 2025 TS Easter Eggs. Fan-made website.
          </p>
          <div className="flex space-x-4 text-xs text-gray-400">
            <a href="#" className="hover:text-orange-500 transition-colors">Privacy</a>
            <a href="#" className="hover:text-orange-500 transition-colors">Terms</a>
            <a href="#" className="hover:text-orange-500 transition-colors">DMCA</a>
            <a href="https://forms.gle/6zFMZciLH7jPMFMUA" target="_blank" rel="noopener noreferrer" className="hover:text-orange-500 transition-colors">Feedback</a>
            <a href="https://forms.gle/6zFMZciLH7jPMFMUA" target="_blank" rel="noopener noreferrer" className="hover:text-orange-500 transition-colors">Report Issues</a>
          </div>
        </div>
        
        {/* Tiny Legal Disclaimer */}
        <div className="mt-2 text-center">
          <p className="text-xs text-gray-300 leading-tight">
            Not affiliated with Taylor Swift. Fan-created content only. 
            All trademarks belong to their respective owners.
          </p>
        </div>
      </div>
    </footer>
  )
} 