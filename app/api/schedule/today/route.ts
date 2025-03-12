import { authOptions } from "@/lib/auth.config";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const decoded = await getServerSession(authOptions);

    if (!decoded) {
      return NextResponse.json(
        { error: "Invalid user" },
        { status: 403 }
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const schedules = await prisma.schedule.findMany({
      where: {
        OR: [{ userId: decoded.user.id }, { trainerId: decoded.user.id }],
        date: {
          gte: today,
          lt: tomorrow,
        },
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
        trainer: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json({ schedules });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      },
      { status: 500 }
    );
  }
}
