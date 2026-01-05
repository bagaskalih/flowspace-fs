import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/boards - List boards
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const divisionId = session.user.divisionId;
    const userRole = session.user.role;

    // Fetch user's actual division from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { divisionId: true },
    });

    const actualDivisionId = user?.divisionId;

    const whereConditions: any[] = [
      { type: "general" },
      { type: "personal", boardAccess: { some: { userId } } },
    ];

    // Admin and master can see all division boards, regular users only see their own
    if (userRole === "admin" || userRole === "master") {
      whereConditions.push({ type: "division" });
    } else if (actualDivisionId) {
      whereConditions.push({ type: "division", divisionId: actualDivisionId });
    }

    const boards = await prisma.board.findMany({
      where: {
        OR: whereConditions,
      },
      include: {
        division: {
          select: { id: true, name: true },
        },
        _count: {
          select: { tasks: true, issues: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(boards);
  } catch (error) {
    console.error("Get boards error:", error);
    return NextResponse.json(
      { error: "Failed to fetch boards" },
      { status: 500 }
    );
  }
}

// POST /api/boards - Create board
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, type, divisionId, description } = body;

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

      // Fetch user's actual division from database
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { divisionId: true },
      });

      const actualDivisionId = user?.divisionId;

      // Only restrict if user is not admin/master and trying to create for different division
      if (
        session.user.role !== "admin" &&
        session.user.role !== "master" &&
        actualDivisionId !== divisionId
      ) {
        console.log("Board creation forbidden:", {
          userRole: session.user.role,
          actualDivisionId,
          requestedDivisionId: divisionId,
        });
        return NextResponse.json(
          { error: "You can only create boards for your division" },
          { status: 403 }
        );
      }
    }

    const boardData: any = {
      name,
      type,
      description,
    };

    if (type === "division") {
      boardData.divisionId = divisionId;
    }

    const board = await prisma.board.create({
      data: boardData,
      include: {
        division: { select: { id: true, name: true } },
      },
    });

    // If personal board, create access for the creator
    if (type === "personal") {
      await prisma.boardAccess.create({
        data: {
          boardId: board.id,
          userId: session.user.id,
          canEdit: true,
        },
      });
    }

    return NextResponse.json(board, { status: 201 });
  } catch (error) {
    console.error("Create board error:", error);
    return NextResponse.json(
      { error: "Failed to create board" },
      { status: 500 }
    );
  }
}
