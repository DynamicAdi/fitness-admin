"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useEffect, useState } from "react"
import { toast } from "sonner"

interface User {
  id: string
  name: string
  email: string
  phone?: string
  status: "ACTIVE" | "INACTIVE"
  membership: "BASIC" | "PREMIUM" | null
  trainer: {
    id: string
    name: string
  } | null
}

interface EditUserModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User
  onSuccess: () => void
}

export function EditUserModal({ open, onOpenChange, user, onSuccess }: EditUserModalProps) {
  const [name, setName] = useState(user.name)
  const [email, setEmail] = useState(user.email)
  const [phone, setPhone] = useState(user?.phone || "+")
  const [membership, setMembership] = useState(user.membership)
  const [trainerId, setTrainerId] = useState<string | undefined>(user.trainer?.id)
  const [trainers, setTrainers] = useState<{ id: string; name: string }[]>([])

  useEffect(() => {
    const fetchTrainers = async () => {
      try {
        const response = await fetch("/api/users/trainers")
        if (response.ok) {
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
    try {
      const payload = {
        name,
        email,
        membership,
        phone,
        status: membership == null ? "INACTIVE" : "ACTIVE",
        trainerId,
      }
      const response = await fetch(`/api/users/user/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        onOpenChange(false)
        onSuccess()
        toast.success("User updated successfully")
        window.location.reload()
      } else {
        console.error("Failed to update user")
      }
    } catch (error) {
      console.error("Error updating user:", error)
      toast.error("An error occurred while updating the user")
    }
  }

  const handleChange = (value: string) => {

    
    if (!value.startsWith("+")) {
      value = "+" + value.replace(/\+/g, "");
    }

    
    value = "+" + value.slice(1).replace(/\D/g, "");

    
    const match = value.match(/^(\+\d{0,3})(\d{0,10})/);
    if (match) {
      value = match[1] + match[2];
    }

    
    const withoutPlus = value.slice(1);
    const matchParts = withoutPlus.match(/^(\d*)(\d*)$/);
    const countryCode = matchParts ? matchParts[1] : "";
    const mainNumber = matchParts ? matchParts[2] : "";

    if (countryCode.length === 0) {
      console.warn("Country code is required.");
    }
    if (mainNumber.length > 10) {
      console.warn("Main number can only be up to 10 digits.");
    }

    setPhone(value);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter full name"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email"
              required
            />
          </div>
                    <div className="grid gap-2">
            <Label htmlFor="email">Phone</Label>
            <Input
              id="phone"
              type="phone"
              value={phone}
              onChange={(e) => handleChange(e.target.value)}
              placeholder="Enter Phone No. in INTERNATIONAL FORMAT" max={13} maxLength={13}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="membership">Membership Type</Label>
            <Select
              value={membership || "None"}
              onValueChange={(value: "BASIC" | "PREMIUM" | "None") => setMembership(value === "None" ? null : value)}
            >
              <SelectTrigger id="membership">
                <SelectValue placeholder="Select membership type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="None">None</SelectItem>
                <SelectItem value="BASIC">Basic</SelectItem>
                <SelectItem value="PREMIUM">Premium</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="trainerId">Assigned Trainer</Label>
            <Select
              value={trainerId || "None"}
              onValueChange={(value) => setTrainerId(value === "None" ? undefined : value)}
            >
              <SelectTrigger id="trainerId">
                <SelectValue placeholder="Select a trainer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="None">None</SelectItem>
                {trainers.map((trainer) => (
                  <SelectItem key={trainer.id} value={trainer.id}>
                    {trainer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 dark:bg-blue-700">
              Update User
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}