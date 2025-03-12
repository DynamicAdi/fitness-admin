import { authOptions } from "@/lib/auth.config";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const {
      date,
      startTime,
      endTime,
      scheduleSubject,
      scheduleDescription,
      userId,
      trainerId,
    } = body;

    if (
      !date ||
      !startTime ||
      !endTime ||
      !scheduleSubject ||
      !userId ||
      !trainerId
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Combine date and time strings into a single Date object
    const combineDateAndTime = (dateStr: string, timeStr: string) => {
      const [year, month, day] = dateStr.split("-").map(Number);
      const [hours, minutes] = timeStr.split(":").map(Number);
      return new Date(year, month - 1, day, hours, minutes);
    };

    const [user, trainer] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.user.findUnique({ where: { id: trainerId } }),
    ])

    const schedule = await prisma.schedule.create({
      data: {
        date: new Date(date),
        startTime: combineDateAndTime(date, startTime),
        endTime: combineDateAndTime(date, endTime),
        scheduleSubject,
        scheduleDescription,
        status: "pending",
        userId,
        trainerId,
      },
    });

    // Create notification
    await prisma.notification.create({
      data: {
        message: `New schedule created: ${scheduleSubject} on ${new Date(date).toLocaleDateString()} at ${combineDateAndTime(date, startTime).toLocaleTimeString()} for ${user?.name} with trainer ${trainer?.name}`,
        scheduleId: schedule.id,
        userId,
        trainerId,
      },
    })

    return NextResponse.json({ schedule }, { status: 201 });
  } catch (error) {
    // console.error("Error creating schedule:", error);
    return NextResponse.json(
      {
        error: "An error occurred while creating the schedule",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
