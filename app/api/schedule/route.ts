import { authOptions } from "@/lib/auth.config";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { type NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

async function updateScheduleStatuses() {
  const now = new Date();

  await prisma.schedule.updateMany({
    where: {
      endTime: { lt: now }, 
      attended: true,       
      status: { not: "completed" }, 
    },
    data: { status: "completed" },
  });
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN" && session.user.role !== "TRAINER")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = Number.parseInt(searchParams.get("page") || "1");
    const limit = Number.parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const statusFilter = searchParams.get("status") || "";

    const skip = (page - 1) * limit;

    await updateScheduleStatuses();

    // Build where clause dynamically
    const whereClause: any = {};

    if (search) {
      whereClause.scheduleSubject = {
        contains: search,
        mode: "insensitive",
      };
    }

    if (statusFilter) {
      whereClause.status = statusFilter;
    }

    const schedules = await prisma.schedule.findMany({
      where: whereClause,
      include: {
        user: { select: { name: true, image: true } },
        trainer: { select: { name: true, image: true } },
      },
      skip,
      take: limit,
      orderBy: [
        { date: "desc" },      
        { startTime: "asc" }, 
      ],
    });

    const total = await prisma.schedule.count({ where: whereClause });

    return NextResponse.json({
      schedules,
      totalPages: Math.ceil(total / limit),
    });

  } catch (error) {
    console.error("Error fetching schedules:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unknown error occurred" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { date, startTime, endTime, scheduleSubject, scheduleDescription, userId, trainerId } = body;

    if (!date || !startTime || !endTime || !scheduleSubject || !userId || !trainerId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const combineDateAndTime = (dateStr: string, timeStr: string) => {
      return new Date(`${dateStr}T${timeStr}`);
    };

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

    return NextResponse.json({ schedule }, { status: 201 });
  } catch (error) {
    console.error("Error creating schedule:", error);
    return NextResponse.json(
      {
        error: "An error occurred while creating the schedule",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
