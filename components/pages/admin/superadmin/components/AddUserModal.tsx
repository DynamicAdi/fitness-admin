"use client"

import { useState, useEffect } from "react"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

interface AddUserModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function AddUserModal({ open, onOpenChange, onSuccess }: AddUserModalProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [trainers, setTrainers] = useState<{ id: string; name: string }[]>([])

  useEffect(() => {
    const fetchTrainers = async () => {
      try {
        const response = await fetch("/api/users/userList")
        
        if (response.status === 200) {
            const data = await response.json()
          setTrainers(data)
        }
      } catch (error) {
        console.error("Error fetching trainers:", error)
      }
    }
    fetchTrainers()
  }, [])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const value = formData.get("adminFor")
    const type = formData.get("adminType")

        console.log(value)
    try {
        const res = await fetch("/api/users/userList", {
            method: "POST",
            body: JSON.stringify({id: value, selectedRole: type})
        })
        if (res.status === 200) {
            window.location.reload()
        }
    } catch (error) {
      console.error("Error While prompting:", error)
      toast.error("An error occurred while creating the user.")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Admin</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="adminFor">Assigned New Admin</Label>
            <Select name="adminFor">
              <SelectTrigger id="adminFor">
                <SelectValue placeholder="Select a User or Trainer" />
              </SelectTrigger>
              <SelectContent>
                {trainers.map((trainer) => (
                  <SelectItem key={trainer.id} value={trainer.id}>
                    {trainer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="adminType">Admin Type</Label>
            <Select name="adminType">
              <SelectTrigger id="adminType">
                <SelectValue placeholder="Select Type" />
              </SelectTrigger>
              <SelectContent>
                  <SelectItem value={"ADMIN"}>
                    ADMIN
                  </SelectItem>
                  <SelectItem value={"SUPER_ADMIN"}>
                    SUPER ADMIN
                  </SelectItem>
                {/* {trainers.map((trainer) => (
                ))} */}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              Add Admin
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}