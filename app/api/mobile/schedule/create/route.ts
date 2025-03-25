import { authMiddleware } from "@/middleware"
import { PrismaClient } from "@prisma/client"
import type { JwtPayload } from "jsonwebtoken"
import { type NextRequest, NextResponse } from "next/server"

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const decoded = (await authMiddleware(request)) as JwtPayload & {
      id: string
      role: string
    }
    const body = await request.json()

    const { date, startTime, endTime, scheduleLink, scheduleSubject, scheduleDescription, sessionType } =
      body

    if (!date || !startTime || !endTime || !scheduleSubject || !sessionType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const schedule = await prisma.schedule.create({
      data: {
        date: new Date(date),
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        scheduleLink,
        scheduleSubject,
        scheduleDescription,
        sessionType,
        status: "waitingToApproved",
        userId: decoded.id,
      },
    })

    return NextResponse.json({ schedule }, { status: 201 })
  } catch (error) {
    console.error("Schedule creation error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unknown error occurred" },
      { status: 500 },
    )
  }
}