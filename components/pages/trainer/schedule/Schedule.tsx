"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { TodaysSchedule } from "./components/todays-schedule"
import { WeeklySchedule } from "./components/weekly-schedule"
import { EditScheduleModal } from "./components/edit-schedule-modal"
import { DeleteScheduleModal } from "./components/delete-schedule-modal"
import { AddClassModal } from "./components/add-class-modal"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { useSession } from "next-auth/react"
import type { Schedule } from "@/types/schedule"

export default function SchedulePage() {
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null)
  const [deletingSchedule, setDeletingSchedule] = useState<Schedule | null>(null)
  const [isAddClassModalOpen, setIsAddClassModalOpen] = useState(false)
  const [users, setUsers] = useState<{ id: string; name: string }[]>([])
  const { data: session } = useSession()

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/users/user")
        if (!response.ok) {
          throw new Error("Failed to fetch users")
        }
        const data = await response.json()
        setUsers(data.users)
      } catch (error) {
        console.error("Error fetching users:", error)
        toast.error("Failed to load users")
      }
    }
    fetchUsers()
  }, [])

  const handleEdit = (item: Schedule) => {
    setEditingSchedule(item)
  }

  const handleDelete = (item: Schedule) => {
    setDeletingSchedule(item)
  }

  const handleSaveEdit = async (updatedSchedule: Partial<Schedule>) => {
    if (editingSchedule) {
      try {
        const response = await fetch(`/api/schedule/${editingSchedule.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedSchedule),
        })
        if (!response.ok) {
          throw new Error("Failed to update schedule")
        }
        toast.success("Schedule updated successfully")
        window.location.reload()
      } catch (error) {
        console.error("Error updating schedule:", error)
        toast.error("An error occurred while updating the schedule")
      }
    }
    setEditingSchedule(null)
  }

  const handleConfirmDelete = async () => {
    if (deletingSchedule) {
      try {
        const response = await fetch(`/api/schedule/${deletingSchedule.id}`, {
          method: "DELETE",
        })
        if (!response.ok) {
          throw new Error("Failed to delete schedule")
        }
        toast.success("Schedule deleted successfully")
        window.location.reload()
      } catch (error) {
        console.error("Error deleting schedule:", error)
        toast.error("An error occurred while deleting the schedule")
      }
    }
    setDeletingSchedule(null)
  }

  const handleAddClass = () => {
    setIsAddClassModalOpen(true)
  }

  const handleSaveNewClass = async (newClass: {
    date: string
    startTime: string
    endTime: string
    scheduleSubject: string
    scheduleDescription: string
    userId: string
  }) => {
    try {
      const response = await fetch("/api/schedule/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...newClass,
          trainerId: session?.user.id,
        }),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to add new class")
      }
      toast.success("New class added successfully")
      window.location.reload()
    } catch (error) {
      console.error("Error adding new class:", error)
      toast.error(error instanceof Error ? error.message : "An error occurred while adding the new class")
    }
    setIsAddClassModalOpen(false)
  }

  const handleExport = () => {
    // Implement export functionality
    console.log("Export schedule")
  }

  return (
    <div className="space-y-6 p-2 lg:ml-64">
      <div className="h-full px-4 py-6 lg:px-8">
        <TodaysSchedule onEdit={handleEdit} onDelete={handleDelete} />
        <ScrollArea className="w-full">
          <div className="pr-4">
            <WeeklySchedule onAddClass={handleAddClass} onExport={handleExport} />
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
      {editingSchedule && (
        <EditScheduleModal
          schedule={editingSchedule}
          isOpen={!!editingSchedule}
          onClose={() => setEditingSchedule(null)}
          onSave={handleSaveEdit}
        />
      )}
      {deletingSchedule && (
        <DeleteScheduleModal
          schedule={deletingSchedule}
          isOpen={!!deletingSchedule}
          onClose={() => setDeletingSchedule(null)}
          onConfirm={handleConfirmDelete}
        />
      )}
      <AddClassModal
        isOpen={isAddClassModalOpen}
        onClose={() => setIsAddClassModalOpen(false)}
        onSave={handleSaveNewClass}
        users={users}
      />
    </div>
  )
}