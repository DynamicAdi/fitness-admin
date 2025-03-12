import { authOptions } from "@/lib/auth.config";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const [totalTrainers, activeTrainers, trainers] = await Promise.all([
      prisma.user.count({ where: { role: "TRAINER" } }),
      prisma.user.count({ where: { role: "TRAINER", status: "ACTIVE" } }),
      prisma.user.findMany({
        where: { role: "TRAINER" },
        select: {
          rating: true,
          clientsCount: true,
          name: true,
          sessions: true,
          status: true,
          clients: true,
        },
      }),
    ]);

    const totalRating = trainers.reduce(
      (sum, trainer) => sum + (trainer.rating || 0),
      0
    );
    const avgRating = totalTrainers > 0 ? totalRating / totalTrainers : 0;

    const totalClients = trainers.reduce(
      (sum, trainer) => sum + (trainer.clients.length ?? 0),
      0
    );

    return NextResponse.json({
      trainers,
      totalTrainers,
      activeTrainers,
      avgRating,
      totalClients,
    });
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
