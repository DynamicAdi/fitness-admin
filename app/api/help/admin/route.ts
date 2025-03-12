
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server"
const prisma = new PrismaClient();
export async function GET(request: NextRequest) {
  try {
    const chats = await prisma.chat.findMany({
        include: {
          user: {
            select: {
              name: true,
              image: true,
            },
          },
          trainer: {
            select: {
              name: true,
              image: true,
            },
          },
        },
      });

      const trainerUserCounts = await prisma.chat.groupBy({
        by: ['trainerId'],
        _count: {
          userId: true, // Count distinct users for each trainer
        },
      });
      
      // Fetch trainer details along with the count if needed
      const trainerDetailsWithCounts = await Promise.all(
        trainerUserCounts.map(async (trainerCount) => {
          const trainer = await prisma.user.findUnique({
            where: { id: trainerCount.trainerId },
            select: { name: true, image: true }, // Include any trainer details needed
          });
      
          return {
            trainerName: trainer?.name || 'Unknown',
            trainerImage: trainer?.image || null,
            userCount: trainerCount._count.userId,
          };
        })
      );

    return NextResponse.json({ chats, trainerDetailsWithCounts });

  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unknown error occurred" },
      { status: 500 },
    )
  }
}