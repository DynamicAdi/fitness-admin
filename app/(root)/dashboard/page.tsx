import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth.config"
import TrainerDashboard from "@/components/pages/dashboard/TrainerDashboard"
import DashboardPage from "@/components/pages/dashboard/AdminDashboard"

export default async function Dashboard() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/signin")
  }

  // Type guard to ensure session.user exists and has a role property
  if (!session.user || typeof session.user.role !== 'string') {
    console.error("User session is invalid or missing role information")
    redirect("/signin")
  }

  // Render the appropriate dashboard based on the user's role
  if (session.user.role === 'ADMIN') {
    return <DashboardPage />
  } else if (session.user.role === 'TRAINER') {
    return <TrainerDashboard />
  } else {
    console.error(`Unknown user role: ${session.user.role}`)
    redirect("/signin")
  }
}