"use client"

import { useState, useEffect } from "react"
import { Activity, Calendar, Clock, TrendingUp } from "lucide-react"
import { toast } from "sonner"
import { AssignSessionModal } from "./components/assign-session-modal"
import { SessionsTable } from "./components/sessions-table"
import { UnifiedStatCard } from "@/components/pages/components/unified-stat-card"
import { Button } from "@/components/ui/button"
import type { Session } from "@/types/schedule"
import { useAdminContext } from "@/context/admin"



interface Stats {
  totalSessions: number
  activeSessions: number
  pendingSessions: number
  completionRate: number
}

export default function Sessions() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const { sessionsStats: stats, setSessionsStats } = useAdminContext()

  useEffect(() => {
    setIsClient(true)
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/schedule/stats")
      const data = await response.json()
      setSessionsStats(data)
    } catch (error) {
      console.error("Error fetching stats:", error)
      toast.error("Failed to fetch session statistics")
    }
  }

  const handleAssignSession = async (data: unknown) => {
    try {
      const response = await fetch("/api/schedule/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
      if (response.ok) {
        fetchStats()
        toast.success("Session assigned successfully")
        setIsModalOpen(false)
        window.location.reload()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to assign session")
      }
    } catch (error) {
      console.error("Error assigning session:", error)
      toast.error(error instanceof Error ? error.message : "Failed to assign session")
    }
  }

  const handleEditSession = async (id: string, data: Partial<Session>) => {
    try {
      const response = await fetch(`/api/schedule/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
      if (response.ok) {
        fetchStats()
        toast.success("Session updated successfully")
        window.location.reload()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update session")
      }
    } catch (error) {
      console.error("Error updating session:", error)
      toast.error(error instanceof Error ? error.message : "Failed to update session")
    }
  }

  const handleDeleteSession = async (id: string) => {
    try {
      const response = await fetch(`/api/schedule/${id}`, {
        method: "DELETE",
      })
      if (response.ok) {
        fetchStats()
        toast.success("Session deleted successfully")
        window.location.reload()
      } else {
        throw new Error("Failed to delete session")
      }
    } catch (error) {
      console.error("Error deleting session:", error)
      toast.error("Failed to delete session")
    }
  }

  const handleAddLink = async (id: string, link: string) => {
    try {
      const response = await fetch(`/api/schedule/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ scheduleLink: `${link}` }),
      })
      if (response.ok) {
        fetchStats()
        toast.success("Link added successfully")
        window.location.reload()
      } else {
        throw new Error("Failed to add link")
      }
    } catch (error) {
      console.error("Error adding link:", error)
      toast.error("Failed to add link")
    }
  }



  return (
    <div className="space-y-8 p-8 lg:ml-64">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isClient && (
          <>
            <UnifiedStatCard
              title="Total Sessions"
              value={stats.totalSessions.toString()}
              icon={Calendar}
              className="bg-blue-600 dark:bg-blue-700"
            />
            <UnifiedStatCard
              title="Active Sessions"
              value={stats.activeSessions.toString()}
              icon={Clock}
              className="bg-green-600 dark:bg-green-700"
            />
            <UnifiedStatCard
              title="Pending Sessions"
              value={stats.pendingSessions.toString()}
              icon={Activity}
              className="bg-amber-600 dark:bg-amber-700"
            />
            <UnifiedStatCard
              title="Completion Rate"
              value={`${stats.completionRate.toFixed(2)}%`}
              icon={TrendingUp}
              className="bg-purple-600 dark:bg-purple-700"
            />
          </>
        )}
      </div>

      <div className="space-y-4">
        <div className="lg:flex items-center justify-between">
          <h2 className="text-2xl font-bold mb-5 lg:mb-0">Session Management</h2>
          {isClient && (
            <Button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">
              Assign Session
            </Button>
          )}
        </div>

        {isClient && (
          <SessionsTable onEdit={handleEditSession} onDelete={handleDeleteSession} onAddLink={handleAddLink} />
        )}
      </div>

      <AssignSessionModal open={isModalOpen} onOpenChange={setIsModalOpen} onSubmit={handleAssignSession} />
    </div>
  )
}