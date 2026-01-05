import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/calendars/[id] - Get calendar details
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

    const calendar = await prisma.calendar.findUnique({
      where: { id },
      include: {
        division: {
          select: { id: true, name: true },
        },
        events: {
          orderBy: { startDate: "asc" },
        },
      },
    });

    if (!calendar) {
      return NextResponse.json(
        { error: "Calendar not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(calendar);
  } catch (error) {
    console.error("Get calendar error:", error);
    return NextResponse.json(
      { error: "Failed to fetch calendar" },
      { status: 500 }
    );
  }
}

// DELETE /api/calendars/[id] - Delete calendar
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const calendar = await prisma.calendar.findUnique({
      where: { id },
    });

    if (!calendar) {
      return NextResponse.json(
        { error: "Calendar not found" },
        { status: 404 }
      );
    }

    // Only admin/master can delete
    if (!["admin", "master"].includes(session.user.role)) {
      return NextResponse.json(
        { error: "Only admin can delete calendars" },
        { status: 403 }
      );
    }

    await prisma.calendar.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete calendar error:", error);
    return NextResponse.json(
      { error: "Failed to delete calendar" },
      { status: 500 }
    );
  }
}
