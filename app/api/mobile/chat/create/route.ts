import { authMiddleware } from "@/middleware"
import { PrismaClient } from "@prisma/client"
import type { JwtPayload } from "jsonwebtoken"
import { NextRequest, NextResponse } from "next/server"

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const decoded = (await authMiddleware(request)) as JwtPayload & {
      id: string
    }
    const { trainerId } = await request.json()

    // Check for existing chat
    const existingChat = await prisma.chat.findFirst({
      where: {
        AND: [{ userId: decoded.id }, { trainerId }],
      },
    })

    if (existingChat) {
      return NextResponse.json({ chat: existingChat })
    }

    // Create new chat
    const chat = await prisma.chat.create({
      data: {
        userId: decoded.id,
        trainerId,
      },
    })

    return NextResponse.json({ chat })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unknown error occurred" },
      { status: 500 },
    )
  }
}