import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface ScheduleItemProps {
  name: string
  time: string
  type: string
  status: string
  link: string | null
}

export function ScheduleItem({ name, time, type, status, link }: ScheduleItemProps) {
  const statusColors: Record<string, string> = {
    pending: "bg-amber-100 text-amber-100",
    upcoming: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800"
  }

  const handleJoinMeet = () => {
    if (link) {
      window.open(link, '_blank')
    }
  }

  return (
    <div className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarFallback>{name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">{name}</p>
          <p className="text-sm text-muted-foreground">{time} · {type}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Badge variant="secondary" className={statusColors[status]}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
        {status == "upcoming" &&
          <Button variant="outline" size="sm" className="bg-blue-500 text-white" onClick={handleJoinMeet}>
            Join Meet
          </Button>}
      </div>
    </div>
  )
}