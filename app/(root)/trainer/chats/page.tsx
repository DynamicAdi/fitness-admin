import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth.config"
import { PrismaClient } from "@prisma/client"
import ChatList from "@/components/pages/trainer/chats/ChatList"

const prisma = new PrismaClient()

export default async function TrainerChats() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/signin")
  }

  const chats = await prisma.chat.findMany({
    where: {
      trainerId: session.user.id,
    },
    include: {
      user: {
        select: {
          name: true,
          image: true,
          role: true,
        },
      },
      messages: {
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  })

  return (
    <div className="space-y-6 p-2 lg:ml-64">
      <h1 className="text-3xl font-bold mb-6">Your Chats</h1>
      <ChatList chats={chats} />
    </div>
  )
}