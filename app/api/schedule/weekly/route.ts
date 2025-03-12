import { authOptions } from "@/lib/auth.config"
import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"

const prisma = new PrismaClient()

export async function GET() {
  try {
    const decoded = await getServerSession(authOptions)

    if (!decoded) {
        return NextResponse.json(
          { error: "Invalid user" },
          { status: 403 }
        )
      }
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const weekStart = new Date(today)
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 7)

    const schedules = await prisma.schedule.findMany({
      where: {
        OR: [
          { userId: decoded.user.id },
          { trainerId: decoded.user.id }
        ],
        date: {
          gte: weekStart,
          lt: weekEnd
        }
      },
      include: {
        user: {
          select: {
            name: true
          }
        },
        trainer: {
          select: {
            name: true
          }
        }
      }
    })

    const groupedSchedules = schedules.reduce((acc, schedule) => {
      const day = new Date(schedule.date).toLocaleString('en-US', { weekday: 'long' })
      if (!acc[day]) {
        acc[day] = []
      }
      acc[day].push(schedule)
      return acc
    }, {} as Record<string, typeof schedules>)

    return NextResponse.json({ schedules: groupedSchedules })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unknown error occurred" },
      { status: 500 }
    )
  }
}