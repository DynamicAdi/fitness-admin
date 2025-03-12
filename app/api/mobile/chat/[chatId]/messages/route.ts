import { authMiddleware } from "@/middleware"
import { PrismaClient } from "@prisma/client"
import type { JwtPayload } from "jsonwebtoken"
import { NextRequest, NextResponse } from "next/server"

const prisma = new PrismaClient()

type RouteContext = {
  params: Promise<{
    chatId: string
  }>
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { chatId } = await context.params
    const messages = await prisma.message.findMany({
      where: {
        chatId: chatId,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    })

    return NextResponse.json({ messages })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unknown error occurred" },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const decoded = (await authMiddleware(request)) as JwtPayload & {
      id: string
    }
    const { chatId } = await context.params
    const { content } = await request.json()

    const message = await prisma.message.create({
      data: {
        content,
        chatId: chatId,
        senderId: decoded.id,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    })

    return NextResponse.json({ message })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unknown error occurred" },
      { status: 500 },
    )
  }
}