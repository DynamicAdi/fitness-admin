import { type Gender, PrismaClient } from "@prisma/client";
import { type NextRequest, NextResponse } from "next/server";
import type { JwtPayload } from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { authMiddleware } from "@/middleware";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const decoded = (await authMiddleware(request)) as JwtPayload & {
      id: string;
      role: string;
    };

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        gender: true,
        birthDate: true,
        bio: true,
        emailNotifications: true,
        smsNotifications: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const decoded = (await authMiddleware(request)) as JwtPayload & {
      id: string;
      role: string;
    };
    const body = await request.json();
    const { name, gender, profileImage, birthDate, email, password } = body;

    const updateData: {
      name?: string;
      gender?: Gender;
      image?: string;
      birthDate?: Date | null;
      email?: string;
      password?: string;
    } = {};
    if (name !== undefined) updateData.name = name;
    if (gender !== undefined) {
      if (gender === "MALE" || gender === "FEMALE") {
        updateData.gender = gender as Gender;
      } else {
        return NextResponse.json(
          { error: "Invalid gender value. Must be 'MALE' or 'FEMALE'." },
          { status: 400 }
        );
      }
    }
    if (profileImage !== undefined) updateData.image = profileImage;
    if (birthDate !== undefined)
      updateData.birthDate = birthDate ? new Date(birthDate) : null;
    if (email !== undefined) updateData.email = email;
    if (password !== undefined) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const user = await prisma.user.update({
      where: { id: decoded.id },
      data: updateData,
    });

    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const decoded = (await authMiddleware(request)) as JwtPayload & {
      id: string;
      role: string;
    };

    await prisma.user.delete({
      where: { id: decoded.id },
    });

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
