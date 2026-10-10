import { NextResponse } from "next/server";
import { getPayload } from "payload";
import configPromise from "@payload-config";

// Rate limiting map: IP -> array of timestamps
const rateLimitMap = new Map<string, number[]>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 5;

  // Prune map if large
  if (rateLimitMap.size > 1000) {
    for (const [key, timestamps] of rateLimitMap.entries()) {
      if (timestamps.every((t) => now - t >= windowMs)) {
        rateLimitMap.delete(key);
      }
    }
  }

  const timestamps = rateLimitMap.get(ip) || [];
  const validTimestamps = timestamps.filter((t) => now - t < windowMs);

  if (validTimestamps.length >= maxRequests) {
    return false;
  }

  validTimestamps.push(now);
  rateLimitMap.set(ip, validTimestamps);
  return true;
}

export async function POST(req: Request) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        {
          error:
            "Too many registration requests from this IP. Please try again in 15 minutes.",
        },
        { status: 429 },
      );
    }

    const body = await req.json();
    const { name, email, password, confirmPassword, bio, reasonForJoining } =
      body || {};

    // 1. Validate name
    const trimmedName = typeof name === "string" ? name.trim() : "";
    if (trimmedName.length < 2) {
      return NextResponse.json(
        { error: "Please enter your full name (at least 2 characters)." },
        { status: 400 },
      );
    }

    // 2. Validate email
    const trimmedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 },
      );
    }

    // 3. Validate password
    if (typeof password !== "string" || [...password].length < 12) {
      return NextResponse.json(
        {
          error:
            "Password must be at least 12 characters long and include both letters and numbers.",
        },
        { status: 400 },
      );
    }

    if (!/\p{L}/u.test(password) || !/\p{N}/u.test(password)) {
      return NextResponse.json(
        {
          error:
            "Password must contain both letters and numbers.",
        },
        { status: 400 },
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: "Password confirmation does not match." },
        { status: 400 },
      );
    }

    const payload = await getPayload({ config: configPromise });

    const totalUsers = await payload.count({
      collection: "users",
      overrideAccess: true,
    });
    if (totalUsers.totalDocs === 0) {
      return NextResponse.json(
        {
          error:
            "Initial Founder account must be created before editor registrations can be accepted.",
        },
        { status: 503 },
      );
    }

    // 4. Check for existing account
    const existing = await payload.find({
      collection: "users",
      overrideAccess: true,
      limit: 1,
      where: {
        email: { equals: trimmedEmail },
      },
    });

    if (existing.docs.length > 0) {
      const user = existing.docs[0] as unknown as { status?: string };
      if (user.status === "pending") {
        return NextResponse.json(
          {
            error:
              "An editor application with this email address is already pending review by the founder.",
          },
          { status: 400 },
        );
      }
      if (user.status === "rejected") {
        return NextResponse.json(
          {
            error:
              "A prior application with this email address was previously reviewed.",
          },
          { status: 400 },
        );
      }
      if (user.status === "suspended") {
        return NextResponse.json(
          { error: "This account has been suspended." },
          { status: 400 },
        );
      }
      return NextResponse.json(
        {
          error:
            "An account with this email address already exists. Please log in.",
        },
        { status: 400 },
      );
    }

    const createData = {
      name: trimmedName,
      email: trimmedEmail,
      password,
      role: "editor" as const,
      status: "pending" as const,
      bio: typeof bio === "string" ? bio.trim() : "",
      reasonForJoining:
        typeof reasonForJoining === "string" ? reasonForJoining.trim() : "",
      appliedAt: new Date().toISOString(),
    };
    await payload.create({
        collection: "users",
        overrideAccess: true,
        context: { publicEditorRegistration: true },
        data: createData,
    });


    return NextResponse.json(
      {
        success: true,
        message:
          "Your application has been submitted successfully and is awaiting founder approval.",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Editor application error:", error);
    return NextResponse.json(
      {
        error:
          "An unexpected error occurred while processing your application. Please try again.",
      },
      { status: 500 },
    );
  }
}
