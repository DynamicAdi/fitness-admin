import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { google } from "googleapis";

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.NEXTAUTH_URL}/api/auth/google/callback`
);

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');

    if (error) {
      console.error('Google OAuth error:', error);
      return NextResponse.redirect(
        new URL('/error?message=Authentication failed', process.env.NEXTAUTH_URL!)
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL('/error?message=No authorization code received', process.env.NEXTAUTH_URL!)
      );
    }

    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.access_token) {
      throw new Error('No access token received');
    }

    const tokenPromises = [
      prisma.systemConfig.upsert({
        where: { key: 'GOOGLE_ACCESS_TOKEN' },
        update: { value: tokens.access_token },
        create: { key: 'GOOGLE_ACCESS_TOKEN', value: tokens.access_token },
      }),
    ];

    if (tokens.refresh_token) {
      tokenPromises.push(
        prisma.systemConfig.upsert({
          where: { key: 'GOOGLE_REFRESH_TOKEN' },
          update: { value: tokens.refresh_token },
          create: { key: 'GOOGLE_REFRESH_TOKEN', value: tokens.refresh_token },
        })
      );
    }

    if (tokens.expiry_date) {
      tokenPromises.push(
        prisma.systemConfig.upsert({
          where: { key: 'GOOGLE_TOKEN_EXPIRY' },
          update: { value: tokens.expiry_date.toString() },
          create: { key: 'GOOGLE_TOKEN_EXPIRY', value: tokens.expiry_date.toString() },
        })
      );
    }

    await Promise.all(tokenPromises);

    const successPath = '/admin/sessions';
    const successUrl = new URL(successPath, process.env.NEXTAUTH_URL!);

    return NextResponse.redirect(successUrl);

  } catch (error) {
    console.error('Error in Google OAuth callback:', error);
    return NextResponse.redirect(
      new URL('/error?message=Failed to authenticate with Google Calendar', process.env.NEXTAUTH_URL!)
    );
  }
}