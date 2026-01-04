import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/divisions/[id] - Get division details
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

    const division = await prisma.division.findUnique({
      where: { id },
      include: {
        _count: {
          select: { users: true },
        },
      },
    });

    if (!division) {
      return NextResponse.json(
        { error: "Division not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(division);
  } catch (error) {
    console.error("Get division error:", error);
    return NextResponse.json(
      { error: "Failed to fetch division" },
      { status: 500 }
    );
  }
}

// PATCH /api/divisions/[id] - Update division
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admin and master can update divisions
    if (!["admin", "master"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { name } = body;

    // Check if division exists
    const existingDivision = await prisma.division.findUnique({
      where: { id },
    });

    if (!existingDivision) {
      return NextResponse.json(
        { error: "Division not found" },
        { status: 404 }
      );
    }

    // Check if new name is already taken by another division
    if (name && name !== existingDivision.name) {
      const nameExists = await prisma.division.findUnique({
        where: { name },
      });

      if (nameExists) {
        return NextResponse.json(
          { error: "Division name already exists" },
          { status: 400 }
        );
      }
    }

    // Build update data
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;

    const updatedDivision = await prisma.division.update({
      where: { id },
      data: updateData,
      include: {
        _count: {
          select: { users: true },
        },
      },
    });

    return NextResponse.json(updatedDivision);
  } catch (error) {
    console.error("Update division error:", error);
    return NextResponse.json(
      { error: "Failed to update division" },
      { status: 500 }
    );
  }
}

// DELETE /api/divisions/[id] - Delete division
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only master can delete divisions
    if (session.user.role !== "master") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    const division = await prisma.division.findUnique({
      where: { id },
      include: {
        _count: {
          select: { users: true },
        },
      },
    });

    if (!division) {
      return NextResponse.json(
        { error: "Division not found" },
        { status: 404 }
      );
    }

    // Check if division has users
    if (division._count.users > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete division with ${division._count.users} member(s)`,
        },
        { status: 400 }
      );
    }

    await prisma.division.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Division deleted successfully" });
  } catch (error) {
    console.error("Delete division error:", error);
    return NextResponse.json(
      { error: "Failed to delete division" },
      { status: 500 }
    );
  }
}
