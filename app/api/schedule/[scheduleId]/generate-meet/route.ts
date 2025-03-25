import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth.config";
import { google } from "googleapis";

const prisma = new PrismaClient();

const SCOPES = [
  "https://www.googleapis.com/auth/calendar",
  "https://www.googleapis.com/auth/calendar.events",
];

const TOKEN_EXPIRY_BUFFER = 5 * 60 * 1000; // 5 minutes in milliseconds

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.NEXTAUTH_URL}/api/auth/google/callback`
);

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expiry_date?: number;
}

async function saveTokens(tokens: TokenResponse) {
  const promises = [];
  
  promises.push(
    prisma.systemConfig.upsert({
      where: { key: "GOOGLE_ACCESS_TOKEN" },
      update: { value: tokens.access_token },
      create: { key: "GOOGLE_ACCESS_TOKEN", value: tokens.access_token },
    })
  );

  if (tokens.refresh_token) {
    promises.push(
      prisma.systemConfig.upsert({
        where: { key: "GOOGLE_REFRESH_TOKEN" },
        update: { value: tokens.refresh_token },
        create: { key: "GOOGLE_REFRESH_TOKEN", value: tokens.refresh_token },
      })
    );
  }

  if (tokens.expiry_date) {
    promises.push(
      prisma.systemConfig.upsert({
        where: { key: "GOOGLE_TOKEN_EXPIRY" },
        update: { value: tokens.expiry_date.toString() },
        create: { key: "GOOGLE_TOKEN_EXPIRY", value: tokens.expiry_date.toString() },
      })
    );
  }

  await Promise.all(promises);
}

async function getTokens(): Promise<TokenResponse> {
  const [accessToken, refreshToken, tokenExpiry] = await Promise.all([
    prisma.systemConfig.findUnique({ where: { key: "GOOGLE_ACCESS_TOKEN" } }),
    prisma.systemConfig.findUnique({ where: { key: "GOOGLE_REFRESH_TOKEN" } }),
    prisma.systemConfig.findUnique({ where: { key: "GOOGLE_TOKEN_EXPIRY" } }),
  ]);

  if (!accessToken?.value || !refreshToken?.value) {
    throw new Error("REAUTH_REQUIRED");
  }

  const expiryDate = tokenExpiry ? parseInt(tokenExpiry.value) : 0;
  
  if (Date.now() + TOKEN_EXPIRY_BUFFER >= expiryDate) {
    try {
      oauth2Client.setCredentials({
        refresh_token: refreshToken.value,
      });
      
      const { credentials } = await oauth2Client.refreshAccessToken();
      
      await saveTokens({
        access_token: credentials.access_token as string,
        refresh_token: credentials.refresh_token ?? undefined,
        expiry_date: credentials.expiry_date ?? 0,
      });
      return {
        access_token: credentials.access_token as string,
        refresh_token: credentials.refresh_token ?? undefined,
        expiry_date: credentials.expiry_date ?? 0,
      };
    } catch (error) {
      console.error("Error refreshing token:", error);
      throw new Error("REAUTH_REQUIRED");
    }
  }

  return {
    access_token: accessToken.value,
    refresh_token: refreshToken.value,
    expiry_date: expiryDate,
  };
}

type RouteContext = {
  params: Promise<{
    scheduleId: string
  }>
}

export async function POST(
  request: Request,
  context: RouteContext
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN" && session.user.role !== "TRAINER")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { scheduleId } = await context.params

    const schedule = await prisma.schedule.findUnique({
      where: { id: scheduleId },
      include: { user: true, trainer: true },
    });

    if (!schedule) {
      return NextResponse.json({ error: "Schedule not found" }, { status: 404 });
    }

    let tokens: TokenResponse;
    try {
      tokens = await getTokens();
    } catch (error) {
      if (error instanceof Error && error.message === "REAUTH_REQUIRED") {
        const authUrl = oauth2Client.generateAuthUrl({
          access_type: "offline",
          scope: SCOPES,
          prompt: "consent",
          state: encodeURIComponent(request.url),
        });
        return NextResponse.json(
          { error: "Reauthorization required", authUrl },
          { status: 401 }
        );
      }
      throw error;
    }

    oauth2Client.setCredentials({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expiry_date: tokens.expiry_date,
    });

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    const event = {
      summary: schedule.scheduleSubject,
      description: schedule.scheduleDescription || "No additional notes",
      start: {
        dateTime: schedule.startTime.toISOString(),
        timeZone: "UTC",
      },
      end: {
        dateTime: schedule.endTime.toISOString(),
        timeZone: "UTC",
      },
      attendees: [
        { email: schedule.user.email },
        { email: schedule.trainer.email },
        { email: session.user.email },
      ],
      conferenceData: {
        createRequest: {
          requestId: schedule.id,
          conferenceSolutionKey: { type: "hangoutsMeet" },
        },
      },
    };

    const { data } = await calendar.events.insert({
      calendarId: "primary",
      conferenceDataVersion: 1,
      requestBody: event,
    });

    if (!data.hangoutLink) {
      throw new Error("Failed to create Google Meet link");
    }

    const updatedSchedule = await prisma.schedule.update({
      where: { id: scheduleId },
      data: {
        scheduleLink: data.hangoutLink,
        status: "upcoming",
      },
    });

    return NextResponse.json({
      message: "Meeting link generated successfully",
      schedule: updatedSchedule,
      meetLink: data.hangoutLink,
    });
  } catch (error) {
    console.error("Error generating Google Meet link:", error);
    return NextResponse.json(
      { error: "An error occurred while generating the Google Meet link" },
      { status: 500 }
    );
  }
}