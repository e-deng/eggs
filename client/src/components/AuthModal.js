import React, { useState, useEffect } from "react"
import { X, User, Lock, LogIn, UserPlus } from "lucide-react"
import { supabase } from "../supabaseClient"

export default function AuthModal({ isOpen, onClose, onAuthSuccess, mode = "login" }) {
  const [isLogin, setIsLogin] = useState(mode === "login")
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: ""
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Debug logging
  console.log("AuthModal mode:", mode, "isLogin:", isLogin)

  // Update mode when prop changes
  useEffect(() => {
    console.log("AuthModal useEffect - mode changed to:", mode)
    setIsLogin(mode === "login")
            setFormData({ email: "", password: "", username: "" })
        setError("")
      }, [mode])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      if (isLogin) {
        // Sign in
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password
        })

        if (error) throw error

        if (data.user) {
          // Get user profile with username
          const { data: profile } = await supabase
            .from('users')
            .select('username')
            .eq('id', data.user.id)
            .single()

          const userWithUsername = {
            ...data.user,
            username: profile?.username || 'User'
          }

          localStorage.setItem("user", JSON.stringify(userWithUsername))
          onAuthSuccess(userWithUsername)
          onClose()
          setFormData({ email: "", password: "", username: "" })
        }
      } else {
        // Sign up
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: { username: formData.username }
          }
        })

        if (error) throw error

        if (data.user) {
          // Create user profile
          const { error: profileError } = await supabase
            .from('users')
            .insert([{
              id: data.user.id,
              username: formData.username,
              email: formData.email
            }])

          if (profileError) throw profileError

          const userWithUsername = {
            ...data.user,
            username: formData.username
          }

          localStorage.setItem("user", JSON.stringify(userWithUsername))
          onAuthSuccess(userWithUsername)
          onClose()
          setFormData({ email: "", password: "", username: "" })
        }
      }
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const toggleMode = () => {
    setIsLogin(!isLogin)
    setError("")
    setFormData({ email: "", password: "", username: "" })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {isLogin ? "Welcome Back!" : "Join the Community"}
          </h2>
          <button 
            onClick={onClose}
            className="hover:bg-gray-100 p-2 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Enter your email"
              />
            </div>
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Enter your username"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-2 px-4 rounded-lg font-medium disabled:opacity-50 transition-all duration-200"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                {isLogin ? "Signing in..." : "Creating account..."}
              </span>
            ) : (
              <span className="flex items-center justify-center">
                {isLogin ? (
                  <>
                    <LogIn className="h-5 w-5 mr-2" />
                    Sign In
                  </>
                ) : (
                  <>
                    <UserPlus className="h-5 w-5 mr-2" />
                    Create Account
                  </>
                )}
              </span>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button
              onClick={toggleMode}
              className="ml-1 text-orange-600 hover:text-orange-700 font-medium"
            >
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>

        <div className="mt-6 p-4 bg-orange-50 rounded-lg">
          <p className="text-sm text-orange-800">
            <strong>Note:</strong> {isLogin ? "Sign in to post, comment, and like Easter eggs!" : "Create an account to share your discoveries!"}
          </p>
        </div>
      </div>
    </div>
  )
} 