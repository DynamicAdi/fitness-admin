"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function SignIn() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        setError("Invalid credentials")
      } else {
        router.push("/dashboard")
      }
    } catch (error) {
      console.error(error)
      setError("An error occurred during sign in")
    }
  }

  const handleSocialSignIn = (provider: string) => {
    signIn(provider, { callbackUrl: "/dashboard" })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0b1c]">
      <div className="w-full max-w-md p-8 rounded-lg bg-[#12143a] text-white">
        <h1 className="text-2xl font-bold text-center mb-2">Sign In</h1>
        <p className="text-center text-gray-400 mb-6">Sign in to your account</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-2">Email Address</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full p-3 rounded bg-[#1a1c4b] border border-[#2a2c5b]"
              placeholder="john@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-2">Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full p-3 rounded bg-[#1a1c4b] border border-[#2a2c5b]"
              placeholder="••••••••"
              required
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button type="submit" className="w-full p-3 rounded bg-blue-600 hover:bg-blue-700 transition-colors">
            Sign In
          </button>

          <button
            type="button"
            onClick={() => handleSocialSignIn("facebook")}
            className="w-full p-3 rounded bg-[#1877f2] hover:bg-[#1864d2] transition-colors flex items-center justify-center gap-2"
          >
            Sign in with Facebook
          </button>

          <button
            type="button"
            onClick={() => handleSocialSignIn("instagram")}
            className="w-full p-3 rounded bg-gradient-to-r from-[#833ab4] to-[#fd1d1d] hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            Sign in with Instagram
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-gray-400">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-blue-500 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}