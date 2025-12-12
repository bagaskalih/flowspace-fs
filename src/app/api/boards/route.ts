import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/boards - List all accessible boards
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // general, division, personal

    const userId = session.user.id;
    const divisionId = session.user.divisionId;

    let boards;

    if (type === "general") {
      boards = await prisma.board.findMany({
        where: { type: "general" },
        include: {
          division: true,
          _count: {
            select: { tasks: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    } else if (type === "division") {
      if (!divisionId) {
        return NextResponse.json(
          { error: "User not assigned to a division" },
          { status: 400 }
        );
      }

      boards = await prisma.board.findMany({
        where: {
          type: "division",
          divisionId: divisionId,
        },
        include: {
          division: true,
          _count: {
            select: { tasks: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    } else if (type === "personal") {
      boards = await prisma.board.findMany({
        where: {
          type: "personal",
          boardAccess: {
            some: {
              userId,
            },
          },
        },
        include: {
          division: true,
          boardAccess: {
            include: {
              user: {
                select: { id: true, name: true, email: true, avatar: true },
              },
            },
          },
          _count: {
            select: { tasks: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    } else {
      // Return all accessible boards
      boards = await prisma.board.findMany({
        where: {
          OR: [
            { type: "general" },
            { type: "division", divisionId: divisionId || undefined },
            { type: "personal", boardAccess: { some: { userId } } },
          ],
        },
        include: {
          division: true,
          boardAccess: {
            include: {
              user: {
                select: { id: true, name: true, email: true, avatar: true },
              },
            },
          },
          _count: {
            select: { tasks: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    }

    return NextResponse.json(boards);
  } catch (error) {
    console.error("Get boards error:", error);
    return NextResponse.json(
      { error: "Failed to fetch boards" },
      { status: 500 }
    );
  }
}

// POST /api/boards - Create new board
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, description, type, divisionId, userIds } = body;

    if (!name || !type) {
      return NextResponse.json(
        { error: "Name and type are required" },
        { status: 400 }
      );
    }

    if (!["general", "division", "personal"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid board type" },
        { status: 400 }
      );
    }

    // Validate division board
    if (type === "division") {
      if (!divisionId) {
        return NextResponse.json(
          { error: "Division ID required for division boards" },
          { status: 400 }
        );
      }

      // Check if user belongs to the division
      if (session.user.divisionId !== divisionId) {
        return NextResponse.json(
          { error: "You can only create boards for your division" },
          { status: 403 }
        );
      }
    }

    // Create board
    const board = await prisma.board.create({
      data: {
        name,
        description,
        type,
        divisionId: type === "division" ? divisionId : null,
        boardAccess:
          type === "personal"
            ? {
                create: [
                  { userId: session.user.id, canEdit: true },
                  ...(userIds || []).map((id: string) => ({
                    userId: id,
                    canEdit: false,
                  })),
                ],
              }
            : undefined,
      },
      include: {
        division: true,
        boardAccess: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatar: true },
            },
          },
        },
        _count: {
          select: { tasks: true },
        },
      },
    });

    return NextResponse.json(board, { status: 201 });
  } catch (error) {
    console.error("Create board error:", error);
    return NextResponse.json(
      { error: "Failed to create board" },
      { status: 500 }
    );
  }
}
