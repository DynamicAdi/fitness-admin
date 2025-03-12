import { PrismaClient } from "@prisma/client";
import { type NextRequest, NextResponse } from "next/server";
import type { JwtPayload } from "jsonwebtoken";
import { authMiddleware } from "@/middleware";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const decoded = (await authMiddleware(request)) as JwtPayload & {
      id: string;
    };

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        trainer: true
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
