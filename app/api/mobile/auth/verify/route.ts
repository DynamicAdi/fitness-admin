import { PrismaClient } from "@prisma/client";
import { type NextRequest, NextResponse } from "next/server";
import type { JwtPayload } from "jsonwebtoken";
import { authMiddleware } from "@/middleware";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    const user = await prisma.user.findUnique({
      where: { email: email }
    });

    if (!user) {
      return NextResponse.json({ "user": false }, { status: 404 });
    }

    return NextResponse.json({ "user": true }, { status: 200});
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}