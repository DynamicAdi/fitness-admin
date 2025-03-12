"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function SignUp() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      })

      if (res.ok) {
        // Sign in the user after successful registration
        const result = await signIn("credentials", {
          email: formData.email,
          password: formData.password,
          redirect: false,
        })

        if (result?.error) {
          setError("Error signing in after registration")
        } else {
          router.push("/dashboard")
        }
      } else {
        const data = await res.json()
        setError(data.message || "An error occurred during registration")
      }
    } catch (error) {
      console.error(error)
      setError("An error occurred during registration")
    }
  }

  const handleSocialSignUp = (provider: string) => {
    signIn(provider, { callbackUrl: "/dashboard" })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0b1c]">
      <div className="w-full max-w-md p-8 rounded-lg bg-[#12143a] text-white">
        <h1 className="text-2xl font-bold text-center mb-2">Create Account</h1>
        <p className="text-center text-gray-400 mb-6">Sign up for your new account</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-2">Full Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-3 rounded bg-[#1a1c4b] border border-[#2a2c5b]"
              placeholder="John Doe"
              required
            />
          </div>

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

          <div>
            <label className="block text-sm mb-2">Repeat Password</label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="w-full p-3 rounded bg-[#1a1c4b] border border-[#2a2c5b]"
              placeholder="••••••••"
              required
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button type="submit" className="w-full p-3 rounded bg-blue-600 hover:bg-blue-700 transition-colors">
            Sign Up
          </button>

          <button
            type="button"
            onClick={() => handleSocialSignUp("facebook")}
            className="w-full p-3 rounded bg-[#1877f2] hover:bg-[#1864d2] transition-colors flex items-center justify-center gap-2"
          >
            Add Facebook Profile
          </button>

          <button
            type="button"
            onClick={() => handleSocialSignUp("instagram")}
            className="w-full p-3 rounded bg-gradient-to-r from-[#833ab4] to-[#fd1d1d] hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            Add Instagram Profile
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-gray-400">
          Already have an account?{" "}
          <Link href="/signin" className="text-blue-500 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}