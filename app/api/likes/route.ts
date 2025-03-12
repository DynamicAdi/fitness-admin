import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const postId = searchParams.get("postId")
  const userId = searchParams.get("userId")

  if (!postId || !userId) {
    return NextResponse.json({ error: "Missing postId or userId" }, { status: 400 })
  }

  const like = await prisma.like.findUnique({
    where: {
      postId_userId: {
        postId,
        userId,
      },
    },
  })

  return NextResponse.json({ hasLiked: !!like })
}

export async function POST(request: Request) {
  const { postId, userId } = await request.json()

  const existingLike = await prisma.like.findUnique({
    where: {
      postId_userId: {
        postId,
        userId,
      },
    },
  })

  if (existingLike) {
    return NextResponse.json({ error: "User has already liked this post" }, { status: 400 })
  }

  const like = await prisma.like.create({
    data: {
      postId,
      userId,
    },
  })

  return NextResponse.json(like)
}

export async function DELETE(request: Request) {
  const { postId, userId } = await request.json()

  const like = await prisma.like.delete({
    where: {
      postId_userId: {
        postId,
        userId,
      },
    },
  })

  return NextResponse.json(like)
}