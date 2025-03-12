import { authOptions } from "@/lib/auth.config"
import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth"
import { type NextRequest, NextResponse } from "next/server"

const prisma = new PrismaClient()

type RouteContext = {
    params: Promise<{
        userId: string
    }>
  }

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "TRAINER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { userId } = await context.params
    const { currentProgress, notes } = await request.json()

    let status: "IN_PROGRESS" | "NEAR_COMPLETE" | "COMPLETED"
    let wideStatus: "ACTIVE" | "INACTIVE"

    if (currentProgress >= 0 && currentProgress <= 80) {
      status = "IN_PROGRESS"
    } else if (currentProgress > 80 && currentProgress < 100) {
      status = "NEAR_COMPLETE"
    } else {
      status = "COMPLETED"
    }

    if (currentProgress > 0 && currentProgress < 100) {
      wideStatus = "ACTIVE"
    } else {
      wideStatus = "INACTIVE"
    }

    const updatedProgram = await prisma.program.upsert({
      where: { userId: userId },
      update: {
        currentProgress,
        status,
        wideStatus,
        notes,
      },
      create: {
        userId: userId,
        currentProgress,
        status,
        wideStatus,
        notes,
      },
    })

    return NextResponse.json(updatedProgram)
  } catch (error) {
    console.error("Error updating program:", error)
    return NextResponse.json({ error: "An error occurred while updating the program" }, { status: 500 })
  }
}