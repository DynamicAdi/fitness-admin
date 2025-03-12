import { authOptions } from "@/lib/auth.config"
import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"

const prisma = new PrismaClient()

async function updateNotifications() {
  await prisma.notification.deleteMany({
    where: {
      schedule: {
        status: "completed",
      },
    },
  })
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const userId = session.user.id
    const userRole = session.user.role

    await updateNotifications()

    let notifications
    if (userRole === "ADMIN") {
      notifications = await prisma.notification.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: { name: true },
          },
          trainer: {
            select: { name: true },
          },
        },
      })
    } else if (userRole === "TRAINER") {
      notifications = await prisma.notification.findMany({
        where: { trainerId: userId },
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: { name: true },
          },
          trainer: {
            select: { name: true },
          },
        },
      })
    } else {
      notifications = await prisma.notification.findMany({
        where: { userId: userId },
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: { name: true },
          },
          trainer: {
            select: { name: true },
          },
        },
      })
    }

    return NextResponse.json({ notifications })
  } catch (error) {
    return NextResponse.json({ error: "An error occurred while fetching notifications" }, { status: 500 })
  }
}