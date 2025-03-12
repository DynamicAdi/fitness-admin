"use client"

import { Button } from "@/components/ui/button"
import { useTrainerContext } from "@/context/trainer"
import { Settings } from "lucide-react"
import { useState, useEffect } from "react"
import { ProgressItem } from "./components/progress-item"
import { ProgressModal } from "./components/progress-modal"
import { ScheduleItem } from "./components/schedule-item"
import { StatCard } from "./components/stat-card"
import { formatTime } from "@/lib/helper"

interface User {
  id: string
  name: string
  program?: {
    currentProgress: number
    status: string
  }
}

export default function TrainerDashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { trainer, todaySchedule, activePrograms } = useTrainerContext()
  const [users, setUsers] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  useEffect(() => {
    const fetchUsers = async () => {
      const response = await fetch("/api/users/client")
      const data = await response.json()
      setUsers(data)
    }
    fetchUsers()
  }, [])

  const handleUpdateProgress = async (data: {
    userId: string
    progress: number
    notes: string
  }) => {
    try {
      const response = await fetch(`/api/user/${data.userId}/program`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentProgress: data.progress,
          notes: data.notes,
        }),
      })

      if (response.ok) {
        window.location.reload()
      } else {
        console.error("Failed to update progress")
      }
    } catch (error) {
      console.error("Error updating progress:", error)
    }
  }

  return (
    <div className="space-y-6 p-6 lg:ml-64">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard title="Total Clients" value={trainer?.clients?.length || 0} type="clients" />
          <StatCard title="Active Programs" value={activePrograms} type="programs" />
          <StatCard title="Sessions Today" value={todaySchedule.length} type="sessions" />
        </div>

        {/* Dashboard Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Trainer Dashboard Overview</h1>
          <Button variant="ghost" size="icon">
            <Settings className="w-5 h-5" />
          </Button>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Schedule Section */}
          <div className="bg-white rounded-lg shadow">
            <h2 className="p-4 font-medium border-b">Today&apos;s Schedule</h2>
            <div>
              {todaySchedule?.length > 0 ? (
                todaySchedule?.map((schedule) => (
                  <ScheduleItem
                    key={schedule.id}
                    name={schedule.user.name}
                    time={formatTime(schedule.startTime)}
                    type={schedule.scheduleSubject}
                    status={schedule.status}
                    link={schedule.scheduleLink}
                  />
                ))
              ) : (
                <p className="p-4 text-gray-500 text-center">No sessions scheduled for today</p>
              )}
            </div>
          </div>

          {/* Progress Updates Section */}
          <div className="bg-white rounded-lg shadow">
            <h2 className="p-4 font-medium border-b">Client Progress Updates</h2>
            <div>
              {users?.map((user) => (
                <ProgressItem
                  key={user.id}
                  userId={user.id}
                  name={user.name}
                  progress={user.program?.currentProgress || 0}
                  status={user.program?.status || "IN_PROGRESS"}
                  onUpdateProgress={() => {
                    setSelectedUser(user)
                    setIsModalOpen(true)
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Progress Update Modal */}
        <ProgressModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleUpdateProgress}
          initialData={selectedUser}
        />
      </div>
    </div>
  )
}