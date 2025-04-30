import { authOptions } from "@/lib/auth.config"
import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"

const prisma = new PrismaClient()

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const trainers = await prisma.user.findMany({
      where: {
        role:  { in: ["USER", "TRAINER"] },
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      }
    })

    return NextResponse.json(trainers)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unknown error occurred" },
      { status: 500 }
    )
  }
}


export async function POST(req: Request) {
    const session = await getServerSession(authOptions)
    const {id, selectedRole, specialization, image} = await req.json()

    try {
        if (!session || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
        }

        await prisma.user.update({
            where: {id: id},
            data: {role: selectedRole, specialization: specialization, image: image}
        })
    return NextResponse.json({"Message": "Done"})
    }
    catch (e) {
        console.log(e)
        return NextResponse.json({ error: "Error while doing" }, { status: 402 })
    }
}

export async function DELETE(req: Request) {
    const session = await getServerSession(authOptions)
    const {id } = await req.json()

    try {
        if (!session || (session.user.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
        }

        await prisma.user.update({
            where: {id: id},
            data: {role: "USER"}
        })
    return NextResponse.json({"Message": "Done"})
    }
    catch (e) {
        console.log(e)
        return NextResponse.json({ error: "Error while doing" }, { status: 402 })
    }
}