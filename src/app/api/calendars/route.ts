import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/calendars - List calendars
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const userRole = session.user.role;

    // Fetch user's actual division from database to ensure it's up to date
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { divisionId: true },
    });

    const divisionId = user?.divisionId;

    console.log("User fetching calendars:", { userId, divisionId, userRole });

    const whereConditions: any[] = [{ type: "general" }, { type: "personal" }];

    // Admin and master can see all division calendars, regular users only see their own
    if (userRole === "admin" || userRole === "master") {
      whereConditions.push({ type: "division" });
    } else if (divisionId) {
      whereConditions.push({ type: "division", divisionId: divisionId });
    }

    console.log("Calendar where conditions:", whereConditions);

    const calendars = await prisma.calendar.findMany({
      where: {
        OR: whereConditions,
      },
      include: {
        division: {
          select: { id: true, name: true },
        },
        events: {
          include: {
            createdBy: {
              select: { id: true, name: true, email: true },
            },
          },
          orderBy: { startDate: "asc" },
        },
        _count: {
          select: { events: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    console.log("Calendars found:", calendars.length);
    console.log(
      "Calendar details:",
      calendars.map((cal) => ({
        id: cal.id,
        name: cal.name,
        type: cal.type,
        divisionId: cal.divisionId,
        divisionName: cal.division?.name,
        eventCount: cal._count.events,
      }))
    );

    return NextResponse.json(calendars);
  } catch (error) {
    console.error("Get calendars error:", error);
    return NextResponse.json(
      { error: "Failed to fetch calendars" },
      { status: 500 }
    );
  }
}

// POST /api/calendars - Create calendar
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, type, divisionId } = body;

    console.log("Creating calendar:", {
      name,
      type,
      divisionId,
      userRole: session.user.role,
    });

    if (!name || !type) {
      return NextResponse.json(
        { error: "Name and type are required" },
        { status: 400 }
      );
    }

    if (!["general", "division", "personal"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid calendar type" },
        { status: 400 }
      );
    }

    // Validate division calendar
    if (type === "division") {
      if (!divisionId) {
        console.log("Division calendar missing divisionId");
        return NextResponse.json(
          { error: "Division ID required for division calendars" },
          { status: 400 }
        );
      }

      // Only restrict if user is not admin/master and trying to create for different division
      if (
        session.user.role !== "admin" &&
        session.user.role !== "master" &&
        session.user.divisionId !== divisionId
      ) {
        console.log("User not authorized to create calendar for this division");
        return NextResponse.json(
          { error: "You can only create calendars for your division" },
          { status: 403 }
        );
      }
    }

    const calendarData = {
      name,
      type,
      divisionId: type === "division" ? divisionId : null,
    };

    console.log("Calendar data to be created:", calendarData);

    const calendar = await prisma.calendar.create({
      data: calendarData,
      include: {
        division: { select: { id: true, name: true } },
      },
    });

    console.log("Calendar created successfully:", calendar);

    return NextResponse.json(calendar, { status: 201 });
  } catch (error) {
    console.error("Create calendar error:", error);
    return NextResponse.json(
      { error: "Failed to create calendar" },
      { status: 500 }
    );
  }
}
