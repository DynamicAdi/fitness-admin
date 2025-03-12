"use client"

import { useState, useEffect } from 'react'
import { Schedule } from "@/types/schedule"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface EditScheduleModalProps {
    schedule: Schedule | null
    isOpen: boolean
    onClose: () => void
    onSave: (updatedSchedule: Partial<Schedule>) => void
}

export function EditScheduleModal({ schedule, isOpen, onClose, onSave }: EditScheduleModalProps) {
    const [date, setDate] = useState('')
    const [startTime, setStartTime] = useState('')
    const [endTime, setEndTime] = useState('')

    useEffect(() => {
        if (schedule) {
            const scheduleDate = new Date(schedule.date)
            setDate(scheduleDate.toISOString().split('T')[0])

            const startDateTime = new Date(schedule.startTime)
            setStartTime(startDateTime.toTimeString().slice(0, 5))

            const endDateTime = new Date(schedule.endTime)
            setEndTime(endDateTime.toTimeString().slice(0, 5))
        }
    }, [schedule])

    const handleSave = () => {
        if (schedule) {
            const updatedStartTime = new Date(schedule.startTime)
            const [startHours, startMinutes] = startTime.split(':')
            updatedStartTime.setHours(parseInt(startHours, 10), parseInt(startMinutes, 10))

            const updatedEndTime = new Date(schedule.endTime)
            const [endHours, endMinutes] = endTime.split(':')
            updatedEndTime.setHours(parseInt(endHours, 10), parseInt(endMinutes, 10))

            onSave({
                date: new Date(date),
                startTime: updatedStartTime,
                endTime: updatedEndTime,
            })
        }
        onClose()
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Schedule</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="date" className="text-right">
                            Date
                        </Label>
                        <Input
                            id="date"
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="startTime" className="text-right">
                            Start Time
                        </Label>
                        <Input
                            id="startTime"
                            type="time"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="endTime" className="text-right">
                            End Time
                        </Label>
                        <Input
                            id="endTime"
                            type="time"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            className="col-span-3"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit" onClick={handleSave}>Save changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}