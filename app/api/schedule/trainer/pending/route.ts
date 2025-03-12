import { authOptions } from "@/lib/auth.config";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const decoded = await getServerSession(authOptions);

    if (!decoded) {
      return NextResponse.json({ error: "Invalid user" }, { status: 403 });
    }

    if (decoded.user.role !== "TRAINER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const currentDate = new Date();
    const pendingSchedules = await prisma.schedule.findMany({
      where: {
        trainerId: decoded.user.id,
        status: "pending",
        endTime: {
          lt: currentDate,
        },
      },
      include: {
        user: {
          select: {
            name: true,
            gender: true,
            birthDate: true,
          },
        },
      },
    });

    return NextResponse.json({ schedules: pendingSchedules });
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
