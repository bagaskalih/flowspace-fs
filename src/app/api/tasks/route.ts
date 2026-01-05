import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/tasks - List tasks
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter"); // all, my
    const boardId = searchParams.get("boardId");
    const status = searchParams.get("status");
    const divisionFilter = searchParams.get("divisionFilter"); // for admin filtering

    const userId = session.user.id;
    const userRole = session.user.role;

    // Fetch actual divisionId from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { divisionId: true },
    });
    const divisionId = user?.divisionId;

    let where: any = {};

    // Board filter
    if (boardId) {
      where.boardId = boardId;
    } else if (
      userRole === "admin" &&
      divisionFilter &&
      divisionFilter !== "all"
    ) {
      // Admin division filter
      if (divisionFilter === "general") {
        where.board = { type: "general" };
      } else {
        where.board = { type: "division", divisionId: divisionFilter };
      }
    } else if (
      userRole === "admin" &&
      (!divisionFilter || divisionFilter === "all")
    ) {
      // Admin viewing all divisions - no board filter needed, show everything
      // Don't add any board filter
    } else {
      // Filter by accessible boards for non-admin users
      where.board = {
        OR: [
          { type: "general" },
          { type: "division", divisionId: divisionId || undefined },
          { type: "personal", boardAccess: { some: { userId } } },
        ],
      };
    }

    // My tasks filter
    if (filter === "my") {
      where.assignedToId = userId;
    }

    // Status filter
    if (status) {
      where.status = status;
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        board: {
          select: {
            id: true,
            name: true,
            type: true,
            division: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        assignedTo: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        createdBy: {
          select: { id: true, name: true, email: true, avatar: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Get tasks error:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

// POST /api/tasks - Create task
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, boardId, assigneeId, priority, dueDate } = body;

    if (!title || !boardId) {
      return NextResponse.json(
        { error: "Title and board are required" },
        { status: 400 }
      );
    }

    // Check board access
    const board = await prisma.board.findUnique({
      where: { id: boardId },
      include: {
        boardAccess: true,
      },
    });

    if (!board) {
      return NextResponse.json({ error: "Board not found" }, { status: 404 });
    }

    const userId = session.user.id;

    // Fetch user's actual division from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { divisionId: true },
    });

    const actualDivisionId = user?.divisionId;

    const hasAccess =
      board.type === "general" ||
      (board.type === "division" && board.divisionId === actualDivisionId) ||
      (board.type === "personal" &&
        board.boardAccess?.some((a: any) => a.userId === userId));

    if (!hasAccess) {
      console.log("Task creation access denied:", {
        boardType: board.type,
        boardDivisionId: board.divisionId,
        userDivisionId: actualDivisionId,
        userId,
      });
      return NextResponse.json(
        { error: "Access denied to this board" },
        { status: 403 }
      );
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        boardId,
        assignedToId: assigneeId,
        priority: priority || "medium",
        dueDate: dueDate ? new Date(dueDate) : null,
        status: "todo",
        createdById: userId,
      },
      include: {
        board: {
          select: { id: true, name: true, type: true },
        },
        assignedTo: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        createdBy: {
          select: { id: true, name: true, email: true, avatar: true },
        },
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error("Create task error:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}
