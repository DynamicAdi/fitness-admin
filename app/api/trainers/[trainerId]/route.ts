import { authOptions } from "@/lib/auth.config"
import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"

const prisma = new PrismaClient()

type RouteContext = {
  params: Promise<{
    trainerId: string
  }>
}

export async function PUT(
  request: Request,
  context: RouteContext
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { trainerId } = await context.params
    const { name, email, specialization, status, image } = await request.json()

    const updatedTrainer = await prisma.user.update({
      where: { id: trainerId },
      data: {
        name,
        email,
        image,
        specialization,
        status,
      },
    })

    return NextResponse.json(updatedTrainer)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unknown error occurred" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  context: RouteContext
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { trainerId } = await context.params

    await prisma.user.delete({
      where: { id: trainerId },
    })

    return NextResponse.json({ message: "Trainer deleted successfully" })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unknown error occurred" },
      { status: 500 }
    )
  }
}