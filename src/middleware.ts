import { type NextRequest, NextResponse } from "next/server";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "~/server/api/root";

type VerifyTokenOutput = inferRouterOutputs<AppRouter>["auth"]["verifyToken"];

export async function middleware(request: NextRequest) {
  console.log("Middleware executed:", request.nextUrl.pathname);

  // Retrieve the token from cookies
  const token = request.cookies.get("auth-token")?.value;
  if (!token) {
    console.warn("No auth token found in cookies");
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    // Verify the token using the Edge-compatible function
    const userData: VerifyTokenOutput = await verifyTokenOnEdge(token);

    console.log("User data:", userData);

    const pathname = request.nextUrl.pathname;

    // Redirect guests trying to access restricted areas
    if (pathname.startsWith("/member") && userData.role !== "guest") {
      console.warn("Unauthorized access attempt by non-guest user");
      return NextResponse.redirect(new URL("/", request.url));
    }
    else if (pathname.startsWith("/admin") && userData.role !== "admin") {
      console.warn("Unauthorized access attempt by non-guest user");
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Allow the request to proceed
    return NextResponse.next();
  } catch (error) {
    console.error("Auth verification failed:", error);
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/member/:path*", "/admin/:path*"],
};

// Lightweight token verification function for Edge Runtime
async function verifyTokenOnEdge(token: string): Promise<VerifyTokenOutput> {
  const apiUrl = process.env.API_URL;

  if (!apiUrl) {
    console.error("API_URL environment variable is not defined");
    throw new Error("API_URL environment variable is not defined");
  }

  try {
    const response = await fetch(`${apiUrl}/api/verify-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }), // Send the token in the request body
    });

    if (!response.ok) {
      console.error(`Token verification failed with status: ${response.status}`);
      throw new Error("Token verification failed");
    }

    return await response.json(); // Ensure the response is parsed as JSON
  } catch (error) {
    console.error("Error during token verification:", error);
    throw new Error("Failed to verify token");
  }
}