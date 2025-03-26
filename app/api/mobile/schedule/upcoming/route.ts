import { authMiddleware } from "@/middleware"
import { PrismaClient } from "@prisma/client"
import type { JwtPayload } from "jsonwebtoken"
import { type NextRequest, NextResponse } from "next/server"

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const decoded = (await authMiddleware(request)) as JwtPayload & {
      id: string
      role: string
    }

    const upcomingSchedules = await prisma.schedule.findMany({
      where: {
        userId: decoded.id,
        status: {
          in: ["pending"],
        },
        date: {
          gte: new Date(),
        },
      },
      select: {
        id: true,
        date: true,
        startTime: true,
        scheduleLink: true,
        scheduleSubject: true,
        status: true,
        trainer: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        startTime: "asc",
      },
    })

    return NextResponse.json({ schedules: upcomingSchedules })
  } catch (error) {
    console.error("Error fetching upcoming schedules:", error)
    return NextResponse.json({ error: "Failed to fetch upcoming schedules" }, { status: 500 })
  }
}