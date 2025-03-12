import { Users, Dumbbell, Calendar } from 'lucide-react'
import { UnifiedStatCard } from "@/components/pages/components/unified-stat-card"

interface StatCardProps {
  title: string
  value: number
  type: "clients" | "programs" | "sessions"
}

export function StatCard({ title, value, type }: StatCardProps) {
  const icons = {
    clients: Users,
    programs: Dumbbell,
    sessions: Calendar
  }

  const bgColors = {
    clients: "bg-purple-600 dark:bg-purple-700",
    programs: "bg-blue-600 dark:bg-blue-700",
    sessions: "bg-green-600 dark:bg-green-700"
  }

  return (
    <UnifiedStatCard
      title={title}
      value={value}
      icon={icons[type]}
      className={bgColors[type]}
    />
  )
}