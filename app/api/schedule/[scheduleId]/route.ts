import { authOptions } from "@/lib/auth.config";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { type NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

type RouteContext = {
  params: Promise<{
    scheduleId: string;
  }>;
};

export async function PUT(request: Request, context: RouteContext) {
  try {
    const decoded = await getServerSession(authOptions);
    const { scheduleId } = await context.params;
    const body = await request.json();

    if (!decoded) {
      return NextResponse.json({ error: "Invalid user" }, { status: 403 });
    }

    const updateData: any = {};
 
    if (body.date) updateData.date = new Date(body.date);
    if (body.startTime) updateData.startTime = new Date(body.startTime);
    if (body.endTime) updateData.endTime = new Date(body.endTime);
    if (body.scheduleSubject) updateData.scheduleSubject = body.scheduleSubject;
    if (body.trainerId) updateData.trainerId = body.trainerId;
    if (body.status) updateData.status = body.status;
    if (body.scheduleLink) updateData.scheduleLink = body.scheduleLink;

    // handle attended + auto-update status
    if (typeof body.attended === "boolean") {
      updateData.attended = body.attended;

      if (body.attended === true) {
        const existingSchedule = await prisma.schedule.findUnique({
          where: { id: scheduleId },
        });
        if (existingSchedule && existingSchedule.endTime < new Date()) {
          updateData.status = "completed";
        }
      }
    }

    const schedule = await prisma.schedule.update({
      where: {
        id: scheduleId,
      },
      data: updateData,
      include: {
        user: true,
        trainer: true,
      },
    });

    return NextResponse.json({ schedule });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { scheduleId } = await context.params;

    await prisma.schedule.delete({
      where: {
        id: scheduleId,
      },
    });

    return NextResponse.json({ message: "Schedule deleted successfully" });
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
