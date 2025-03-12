import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface ProgressItemProps {
  userId: string
  name: string
  progress: number
  status: string
  onUpdateProgress: () => void
}

export function ProgressItem({ name, progress, status, onUpdateProgress }: ProgressItemProps) {
  const getStatusBadge = () => {
    switch (status) {
      case "COMPLETED":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>
      case "NEAR_COMPLETE":
        return <Badge className="bg-yellow-100 text-yellow-800">Near Complete</Badge>
      default:
        return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>
    }
  }

  return (
    <div className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarFallback>
            {name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">{name}</p>
          <p className="text-sm text-muted-foreground">Progress: {progress}%</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {getStatusBadge()}
        <Button variant="outline" size="sm" className="bg-[#888BF4] text-white" onClick={onUpdateProgress}>
          Update Progress
        </Button>
      </div>
    </div>
  )
}