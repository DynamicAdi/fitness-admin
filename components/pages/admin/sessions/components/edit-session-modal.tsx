import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Session {
  id: string
  date: string
  startTime: string
  endTime: string
  scheduleSubject: string
  scheduleLink?: string
}

interface EditSessionModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (data: Partial<Session>) => void
  session: Session | null
}

export function EditSessionModal({ isOpen, onClose, onConfirm, session }: EditSessionModalProps) {
  const [formData, setFormData] = useState<Partial<Session>>({})

  useEffect(() => {
    if (session) {
      setFormData({
        date: new Date(session.date).toISOString().split("T")[0],
        startTime: new Date(session.startTime).toTimeString().slice(0, 5),
        endTime: new Date(session.endTime).toTimeString().slice(0, 5),
        scheduleSubject: session.scheduleSubject,
      })
    }
  }, [session])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const { date, startTime, endTime, scheduleSubject } = formData
    const updatedData = {
      date: new Date(date as string).toISOString(),
      startTime: new Date(`${date}T${startTime}`).toISOString(),
      endTime: new Date(`${date}T${endTime}`).toISOString(),
      scheduleSubject,
    }
    onConfirm(updatedData)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Session</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Date
              </Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={formData.date || ""}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="startTime" className="text-right">
                Start Time
              </Label>
              <Input
                id="startTime"
                name="startTime"
                type="time"
                value={formData.startTime || ""}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="endTime" className="text-right">
                End Time
              </Label>
              <Input
                id="endTime"
                name="endTime"
                type="time"
                value={formData.endTime || ""}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="scheduleSubject" className="text-right">
                Subject
              </Label>
              <Input
                id="scheduleSubject"
                name="scheduleSubject"
                value={formData.scheduleSubject || ""}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}