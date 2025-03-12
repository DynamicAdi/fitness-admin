import { StatsCards } from "./components/stats-cards"
import { UsersTable } from "./components/users-table"

export default function DashboardPage() {
  return (
    <div className="space-y-8 p-8 lg:ml-64">
      <StatsCards />
      <UsersTable />
    </div>
  )
}