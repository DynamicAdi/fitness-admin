"use client"

import { useEffect, useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { Schedule } from "@/types/schedule"
import { useSession } from 'next-auth/react'
import { formatTime } from '@/lib/helper'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface TodaysScheduleProps {
  onEdit: (item: Schedule) => void
  onDelete: (item: Schedule) => void
}

export function TodaysSchedule({ onEdit, onDelete }: TodaysScheduleProps) {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const { data: sessionData } = useSession()

  useEffect(() => {
    const fetchTodaySchedules = async () => {
      const response = await fetch('/api/schedule/today')
      const data = await response.json()
      setSchedules(data.schedules)
    }

    fetchTodaySchedules()
  }, [])

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Today&apos;s Schedule</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 md:gap-4">
        {schedules.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between rounded-lg border p-3 md:p-4"
          >
            <div className="space-y-1 min-w-0 flex-1">
              <h3 className="font-medium truncate">{item.scheduleSubject}</h3>
              <p className="text-xs md:text-sm text-muted-foreground">
                {formatTime(item.startTime)} - {formatTime(item.endTime)}
              </p>
            </div>
            <div className="flex gap-1 md:gap-2 ml-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(item)}
                className="h-7 w-7 md:h-8 md:w-8"
              >
                <Pencil className="h-3 w-3 md:h-4 md:w-4" />
                <span className="sr-only">Edit {item.scheduleSubject}</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(item)}
                className="h-7 w-7 md:h-8 md:w-8 text-destructive"
              >
                <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
                <span className="sr-only">Delete {item.scheduleSubject}</span>
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}