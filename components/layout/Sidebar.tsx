"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart2, Users, Dumbbell, Calendar, MessageSquare, HeadphonesIcon, Home, LineChart, Settings, HelpCircle, Menu, X } from 'lucide-react'
import { useSession } from "next-auth/react"

// Admin navigation items
const adminNavigation = [
  { name: "Dashboard", href: "/dashboard", icon: BarChart2 },
  { name: "User Management", href: "/admin/users", icon: Users },
  { name: "Trainers", href: "/admin/trainers", icon: Dumbbell },
  { name: "Sessions", href: "/admin/sessions", icon: Calendar },
  { name: "Community", href: "/admin/community", icon: MessageSquare },
  { name: "Chats", href: "/admin/chats", icon: MessageSquare },
  { name: "Chat Support", href: "/admin/support", icon: HeadphonesIcon },
]

// Trainer navigation items - matching the image
const trainerNavigation = [
  { name: "Home", href: "/dashboard", icon: Home },
  { name: "Analytics", href: "/trainer/analytics", icon: LineChart },
  { name: "Schedule", href: "/trainer/schedule", icon: Calendar },
  { name: "Chats", href: "/trainer/chats", icon: MessageSquare },
  { name: "Settings", href: "/trainer/settings", icon: Settings },
  { name: "Help", href: "", icon: HelpCircle },
]

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  
  // Select navigation based on user role
  const navigation = session?.user?.role === "ADMIN" ? adminNavigation : trainerNavigation

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true)
      } else {
        setIsSidebarOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    handleResize() // Call once to set initial state

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <>
      <button
        className=" fixed top-1 left-0 z-50 bg-black p-2 text-white lg:hidden"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
      <aside className={`fixed left-0 top-0 z-40 h-screen w-64 transform border-r border-gray-700 bg-black pt-16 transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="flex h-full flex-col overflow-y-auto px-3 py-4">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center rounded-lg p-2 text-base hover:text-white ${
                      isActive ? "text-white" : "text-gray-600"
                    }`}
                    onClick={() => {
                      if (window.innerWidth < 1024) {
                        setIsSidebarOpen(false)
                      }
                    }}
                  >
                    <item.icon className="h-6 w-6" />
                    <span className="ml-3">{item.name}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      </aside>
    </>
  )
}