import { authOptions } from "@/lib/auth.config"
import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth"
import { type NextRequest, NextResponse } from "next/server"

const prisma = new PrismaClient()

async function updateScheduleStatuses() {
  const now = new Date()

  // Update completed schedules
  await prisma.schedule.updateMany({
    where: {
      endTime: { lt: now },
      status: { not: "completed" },
    },
    data: { status: "completed" },
  })
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN" && session.user.role !== "TRAINER")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const skip = (page - 1) * limit

    // Update statuses before fetching
    await updateScheduleStatuses()

    const schedules = await prisma.schedule.findMany({
      where: {
        scheduleSubject: {
          contains: search,
          mode: "insensitive",
        },
      },
      include: {
        
        user: {
          select: {
            name: true,
            image: true,
          },
        },
        trainer: {
          select: {
            name: true,
            image: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: { date: "desc" },
    })

    const total = await prisma.schedule.count({
      where: {
        scheduleSubject: {
          contains: search,
          mode: "insensitive",
        },
      },
    })

    return NextResponse.json({
      schedules,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unknown error occurred" },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const body = await request.json()
    const { date, startTime, endTime, scheduleSubject, scheduleDescription, userId, trainerId } = body

    if (!date || !startTime || !endTime || !scheduleSubject || !userId || !trainerId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Combine date and time strings into a single Date object
    const combineDateAndTime = (dateStr: string, timeStr: string) => {
      const [year, month, day] = dateStr.split("-").map(Number)
      const [hours, minutes] = timeStr.split(":").map(Number)
      return new Date(year, month - 1, day, hours, minutes)
    }

    const schedule = await prisma.schedule.create({
      data: {
        date: new Date(date),
        startTime: combineDateAndTime(date, startTime),
        endTime: combineDateAndTime(date, endTime),
        scheduleSubject,
        scheduleDescription,
        status: "pending",
        userId,
        trainerId,
      },
    })

    return NextResponse.json({ schedule }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      {
        error: "An error occurred while creating the schedule",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}