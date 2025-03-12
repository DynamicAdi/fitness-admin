import { authOptions } from "@/lib/auth.config"
import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"

const prisma = new PrismaClient()

export async function GET({params}: Promise<{ id: string}>) {
    const {id} = await params
    console.log(id)
  try {
    const data = await prisma.user.findUnique({
        where: {id: id}
    })

    return NextResponse.json({ data: data })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unknown error occurred" },
      { status: 500 }
    )
  }
}