import { PrismaClient } from "@prisma/client";
import { type NextRequest, NextResponse } from "next/server";
import type { JwtPayload } from "jsonwebtoken";
import { authMiddleware } from "@/middleware";

const prisma = new PrismaClient();

export async function PUT(request: NextRequest) {
  try {
    const decoded = (await authMiddleware(request)) as JwtPayload & {
      id: string;
      role: string;
    };
    const body = await request.json();
    const { phone } = body;

    const user = await prisma.user.update({
      where: { id: decoded.id },
      data: {
        phone
      },
    });
    return NextResponse.json({ user }, {status: 200});
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
