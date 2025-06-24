import { authOptions } from "@/lib/auth.config";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

type RouteContext = {
  params: Promise<{
    chatId: string;
  }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { chatId } = await context.params;
    const messages = await prisma.message.findMany({
      where: {
        chatId: chatId,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });
    console.log(
      "Details : ",
      await prisma.message.count({
        where: { chatId },
      })
    );

    // const messagesCount = await prisma.message.count({
    //   where: { chatId },
    // });
    // if (messagesCount === 93) {
    //   const chat = await prisma.chat.findUnique({
    //     where: { id: chatId },
    //     include: {
    //       user: {
    //         select: { name: true },
    //       },
    //       trainer: {
    //         select: { id: true },
    //       },
    //     },
    //   });

    //   if (chat?.trainer.id) {
    //     await new Promise((resolve) => setTimeout(resolve, 5000));

    //     const message = await prisma.message.create({
    //       data: {
    //         content: `Hello ${chat.user.name}, I'll reply to you soon.`,
    //         chatId: chatId,
    //         senderId: chat.trainer.id,
    //       },
    //       include: {
    //         sender: {
    //           select: { id: true, name: true, image: true },
    //         },
    //       },
    //     });
    //   }
    // }

    return NextResponse.json({ messages });
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

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const decoded = await getServerSession(authOptions);

    if (!decoded) {
      return NextResponse.json({ error: "Invalid user" }, { status: 403 });
    }
    const { chatId } = await context.params;
    const { content } = await request.json();

    const message = await prisma.message.create({
      data: {
        content,
        chatId: chatId,
        senderId: decoded.user.id,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    const messagesCount = await prisma.message.count({
      where: { chatId },
    });

    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: { trainer: true },
    });

    if (!chat) {
      throw new Error("Chat not found");
    }

    if (!chat.trainer) {
      throw new Error("Trainer not found");
    }

    const trainerId = chat.trainer.id;

    if (messagesCount == 116) {
      await prisma.message.create({
        data: {
          content: "Hello, I'll reply to you soon.",
          chatId,
          senderId: trainerId,
        },
      });
    }

    return NextResponse.json({ message });
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
