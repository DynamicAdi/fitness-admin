import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { headers } from "next/headers";
import jwt from "jsonwebtoken";

export async function middleware(request: NextRequest) {
  // Apply CORS middleware
  const corsResponse = corsMiddleware(request);

  // Handle preflight requests
  if (request.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 200,
      headers: corsResponse.headers,
    });
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  const path = request.nextUrl.pathname;

  if (path.startsWith("/admin") && token.role !== "ADMIN" && token.role !== "SUPER_ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  // if (path.startsWith("/admin/super") || path.startsWith("/admin/chats") && token.role !== "SUPER_ADMIN") {
  //   return NextResponse.redirect(new URL("/dashboard", request.url));
  // }
  if (path.startsWith("/trainer") && token.role !== "TRAINER") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/trainer/:path*",
    "/dashboard/:path*",
    "/api/schedule/:path*",
  ],
};

export async function authMiddleware(request: NextRequest) {
  // Apply CORS middleware
  const corsResponse = corsMiddleware(request);

  // Handle preflight requests
  if (request.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 200,
      headers: corsResponse.headers,
    });
  }
  try {
    const headersList = await headers();
    const authorization = headersList.get("authorization");
    const token = authorization?.split(" ")[1];

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!);
    return decoded;
  } catch (error) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}

function corsMiddleware(request: NextRequest) {
  const response = NextResponse.next()
  const origin = request.headers.get("origin")

  // Allow requests from your Expo app's development server
  if (origin && (origin.includes("localhost") || origin.includes("127.0.0.1"))) {
    response.headers.set("Access-Control-Allow-Origin", origin)
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization")
    response.headers.set("Access-Control-Allow-Credentials", "true")
  }

  return response
}