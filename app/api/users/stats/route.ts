import { authOptions } from "@/lib/auth.config"
import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"

const prisma = new PrismaClient()

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (
      !session ||
      (session.user.role !== "ADMIN" && session.user.role !== "TRAINER")
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const totalUsers = await prisma.user.count({ where: { role: "USER" } })
    const activeUsers = await prisma.user.count({ where: { role: "USER", status: "ACTIVE" } })
    const inactiveUsers = await prisma.user.count({ where: { role: "USER", status: "INACTIVE" } })

    const currentDate = new Date()
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const newUsers = await prisma.user.count({
      where: {
        role: "USER",
        createdAt: {
          gte: firstDayOfMonth,
        },
      },
    })

    return NextResponse.json({
      totalUsers,
      activeUsers,
      inactiveUsers,
      newUsers,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      },
      { status: 500 }
    )
  }
}