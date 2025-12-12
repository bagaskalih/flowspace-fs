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
    const divisionId = session.user.divisionId;

    const whereConditions: any[] = [{ type: "general" }, { type: "personal" }];

    if (divisionId) {
      whereConditions.push({ type: "division", divisionId: divisionId });
    }

    const calendars = await prisma.calendar.findMany({
      where: {
        OR: whereConditions,
      },
      include: {
        division: true,
        events: {
          orderBy: { startDate: "asc" },
        },
        _count: {
          select: { events: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

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
        return NextResponse.json(
          { error: "Division ID required for division calendars" },
          { status: 400 }
        );
      }

      if (session.user.divisionId !== divisionId) {
        return NextResponse.json(
          { error: "You can only create calendars for your division" },
          { status: 403 }
        );
      }
    }

    const calendar = await prisma.calendar.create({
      data: {
        name,
        type,
        divisionId: type === "division" ? divisionId : null,
      },
      include: {
        division: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(calendar, { status: 201 });
  } catch (error) {
    console.error("Create calendar error:", error);
    return NextResponse.json(
      { error: "Failed to create calendar" },
      { status: 500 }
    );
  }
}
