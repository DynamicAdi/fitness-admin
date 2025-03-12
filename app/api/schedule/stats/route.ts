import { authOptions } from "@/lib/auth.config"
import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"

const prisma = new PrismaClient()

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN" && session.user.role !== "TRAINER")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const totalSessions = await prisma.schedule.count()
    const activeSessions = await prisma.schedule.count({
      where: { status: "upcoming" }
    })
    const pendingSessions = await prisma.schedule.count({
      where: { status: "pending" }
    })
    const completedSessions = await prisma.schedule.count({
      where: { status: "completed" }
    })

    const completionRate = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0

    return NextResponse.json({
      totalSessions,
      activeSessions,
      pendingSessions,
      completionRate
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unknown error occurred" },
      { status: 500 }
    )
  }
}