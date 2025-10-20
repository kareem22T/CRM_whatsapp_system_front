"use client"

import type React from "react"
import { useState } from "react"
import { EyeIcon, EyeOffIcon, MessageCircleIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAppDispatch } from "@/app/hooks"
import { useLoginMutation } from "./authApi"
import { logout, setCredentials } from "./authSlice"

export default function Login() {
  const dispatch = useAppDispatch()
  const [login, { isLoading }] = useLoginMutation()

  const [showPassword, setShowPassword] = useState(false)
  const [isChecked] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    try {
      const response = await login({ email, password }).unwrap()
      
      if (response.success) {
        dispatch(
          setCredentials({
            token: response.data.token,
            user: { email: response.data.user.email, name: response.data.user.name, id: response.data.user.id, role: response.data.user.role },
          }),
        )

        window.location.href = "/"
      } else {
        setError(response.message)
      }
    } catch (err: any) {
      setError(err.data?.message)
      
    }
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h1>
            <p className="text-gray-600">Sign in to access Cyrus System</p>
          </div>
          {error && (
            <div className="mb-6 p-4 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200"
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </Button>
          </form>

        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          © 2025 Cyrus Technology. All rights reserved.
        </p>
      </div>
    </div>
  )
}
