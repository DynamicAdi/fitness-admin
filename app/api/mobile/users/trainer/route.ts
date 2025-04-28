import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const users = await prisma.user.findMany({
      where: {
        role: "TRAINER",
      },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        specialization: true,
        rating: true,
      },
    })

    return NextResponse.json({ users });
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