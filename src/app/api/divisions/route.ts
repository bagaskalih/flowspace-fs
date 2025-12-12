import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/divisions - List all divisions
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const divisions = await prisma.division.findMany({
      include: {
        _count: {
          select: { users: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(divisions);
  } catch (error) {
    console.error("Get divisions error:", error);
    return NextResponse.json(
      { error: "Failed to fetch divisions" },
      { status: 500 }
    );
  }
}

// POST /api/divisions - Create new division
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admin and master can create divisions
    if (!["admin", "master"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // Check if division name already exists
    const existingDivision = await prisma.division.findUnique({
      where: { name },
    });

    if (existingDivision) {
      return NextResponse.json(
        { error: "Division name already exists" },
        { status: 400 }
      );
    }

    const division = await prisma.division.create({
      data: {
        name,
      },
      include: {
        _count: {
          select: { users: true },
        },
      },
    });

    return NextResponse.json(division, { status: 201 });
  } catch (error) {
    console.error("Create division error:", error);
    return NextResponse.json(
      { error: "Failed to create division" },
      { status: 500 }
    );
  }
}
