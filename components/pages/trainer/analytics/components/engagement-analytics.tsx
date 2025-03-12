import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface AnalyticsStat {
  label: string
  value: string
  total: number
}

const stats: AnalyticsStat[] = [
  { label: "Total Posts", value: "156", total: 156 },
  { label: "Comments", value: "1.2K", total: 1200 },
  { label: "Likes", value: "3.4K", total: 3400 },
]

export function EngagementAnalytics() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Post Engagement Analytics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>89% engagement</span>
            <span className="text-emerald-500">High engagement</span>
          </div>
          <Progress value={89} className="h-2" />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>75% engagement</span>
            <span className="text-emerald-500">Good engagement</span>
          </div>
          <Progress value={75} className="h-2" />
        </div>
        <div className="grid grid-cols-3 gap-4 pt-4">
          {stats.map((stat, i) => (
            <div key={i} className="space-y-1">
              <p className="text-xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}