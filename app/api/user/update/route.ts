import { authOptions } from "@/lib/auth.config"
import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth"
import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, email, bio, emailNotifications, smsNotifications, currentPassword, newPassword } = body

    const updateData: {
      name?: string;
      email?: string;
      bio?: string;
      emailNotifications?: boolean;
      smsNotifications?: boolean;
      password?: string;
    } = {
      name,
      email,
      bio,
      emailNotifications,
      smsNotifications,
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { password: true },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // If the user has a password and is trying to change it
    if (user.password && newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: "Current password is required" }, { status: 400 })
      }

      const isPasswordValid = await bcrypt.compare(currentPassword, user.password)

      if (!isPasswordValid) {
        return NextResponse.json({ error: "Invalid current password" }, { status: 400 })
      }

      updateData.password = await bcrypt.hash(newPassword, 10)
    } 
    // If the user doesn't have a password and is setting one for the first time
    else if (!user.password && newPassword) {
      updateData.password = await bcrypt.hash(newPassword, 10)
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
    })

    // Remove sensitive information before sending the response
    const { password, ...userWithoutPassword } = updatedUser

    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: "An error occurred while updating the user" },
      { status: 500 }
    )
  }
}