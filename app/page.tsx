import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import SignUp from "./(auth)/signup/page"

export default async function Home() {
  const session = await getServerSession()

  if (session) {
    redirect("/dashboard")
  }

  return <SignUp />
}