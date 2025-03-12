import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth.config"
import SuperAdmin from "@/components/pages/admin/superadmin/super"

export default async function Dashboard() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/signin")
  }
  
  return <SuperAdmin />
}