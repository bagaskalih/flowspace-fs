import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/calendars/[id]/events - List events in calendar
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const events = await prisma.calendarEvent.findMany({
      where: { calendarId: id },
      orderBy: { startDate: "asc" },
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error("Get events error:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

// POST /api/calendars/[id]/events - Create event in calendar
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { title, description, startDate, endDate, tag } = body;

    if (!title || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Title, start date, and end date are required" },
        { status: 400 }
      );
    }

    // Check if calendar exists
    const calendar = await prisma.calendar.findUnique({
      where: { id },
    });

    if (!calendar) {
      return NextResponse.json(
        { error: "Calendar not found" },
        { status: 404 }
      );
    }

    const event = await prisma.calendarEvent.create({
      data: {
        title,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        tags: tag ? [tag] : [],
        calendarId: id,
        createdById: session.user.id,
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error("Create event error:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}
