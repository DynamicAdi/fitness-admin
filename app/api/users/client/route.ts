import { authOptions } from "@/lib/auth.config"
import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"

const prisma = new PrismaClient()

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "TRAINER")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const clients = await prisma.user.findMany({
      where: {
        role: "USER",
        trainerId: session.user.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        program: {
          select: {
            currentProgress: true,
            status: true,
          },
        },
      },
    })

    return NextResponse.json(clients)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unknown error occurred" },
      { status: 500 },
    )
  }
}