import { authMiddleware } from "@/middleware"
import { PrismaClient } from "@prisma/client"
import type { JwtPayload } from "jsonwebtoken"
import { NextRequest, NextResponse } from "next/server"

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const decoded = (await authMiddleware(request)) as JwtPayload & {
        id: string
        role: string
      }

    const completedSchedules = await prisma.schedule.findMany({
      where: {
        OR: [{ userId: decoded.id }, { trainerId: decoded.id }],
        status: "completed",
      },
      include: {
        user: {
          select: {
            name: true,
            ...(decoded.role === "TRAINER" && {
              gender: true,
              birthDate: true,
            }),
          },
        },
        trainer: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    })

    return NextResponse.json({ schedules: completedSchedules })
  } catch (error) {
    console.error("Error fetching completed schedules:", error)
    return NextResponse.json({ error: "Failed to fetch completed schedules" }, { status: 500 })
  }
}