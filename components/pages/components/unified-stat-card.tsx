import { type LucideIcon } from 'lucide-react'
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface UnifiedStatCardProps {
  icon: LucideIcon
  title: string
  value: string | number
  trend?: string
  className?: string
}

export function UnifiedStatCard({ icon: Icon, title, value, trend, className }: UnifiedStatCardProps) {
  return (
    <Card className={cn("text-white", className)}>
      <CardContent className="flex items-center gap-4 p-6">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/10">
          <Icon className="h-8 w-8 text-white" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium">{title}</p>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-bold">{value}</p>
            {trend && (
              <span className="text-sm font-medium text-emerald-500">
                {trend}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}