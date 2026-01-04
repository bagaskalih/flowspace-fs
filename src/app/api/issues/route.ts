import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/issues - List issues
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");

    let where: any = {};

    if (status) {
      where.status = status;
    }

    if (priority) {
      where.priority = priority;
    }

    const issues = await prisma.issue.findMany({
      where,
      include: {
        createdBy: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        assignedTo: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        _count: {
          select: { comments: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(issues);
  } catch (error) {
    console.error("Get issues error:", error);
    return NextResponse.json(
      { error: "Failed to fetch issues" },
      { status: 500 }
    );
  }
}

// POST /api/issues - Create issue
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, priority, assignedToId, boardId } = body;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    // Create a default board if none exists (temporary solution)
    let defaultBoardId = boardId;
    if (!defaultBoardId) {
      const defaultBoard = await prisma.board.findFirst();
      if (!defaultBoard) {
        const newBoard = await prisma.board.create({
          data: {
            name: "Default Board",
            type: "general",
          },
        });
        defaultBoardId = newBoard.id;
      } else {
        defaultBoardId = defaultBoard.id;
      }
    }

    const issue = await prisma.issue.create({
      data: {
        title,
        description,
        priority: priority || "medium",
        status: "not_started",
        boardId: defaultBoardId,
        assignedToId,
        createdById: session.user.id,
      },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        assignedTo: {
          select: { id: true, name: true, email: true, avatar: true },
        },
      },
    });

    return NextResponse.json(issue, { status: 201 });
  } catch (error) {
    console.error("Create issue error:", error);
    return NextResponse.json(
      { error: "Failed to create issue" },
      { status: 500 }
    );
  }
}
