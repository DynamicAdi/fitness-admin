import { MetricCards } from "./components/metric-cards"
import { CommunityPosts } from "./components/community-posts"
import { EngagementAnalytics } from "./components/engagement-analytics"
import { RecentActivity } from "./components/recent-activity"

export default function Analytics() {
  return (
    <div className="space-y-6 p-6 lg:ml-64">
      <MetricCards />
      <div>
        <CommunityPosts />
        {/* <EngagementAnalytics /> */}
      </div>
      <RecentActivity />
    </div>
  )
}