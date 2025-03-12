import { authMiddleware } from "@/middleware"
import { PrismaClient } from "@prisma/client"
import type { JwtPayload } from "jsonwebtoken"
import { NextRequest, NextResponse } from "next/server"

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const decoded = (await authMiddleware(request)) as JwtPayload & {
      id: string
    }
    const user = await prisma.user.findUnique({
        where: {id: decoded.id},
        select: {
            trainer: true
        }
    })

    return NextResponse.json({ user })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unknown error occurred" },
      { status: 500 },
    )
  }
}