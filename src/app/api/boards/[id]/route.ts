import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/boards/[id] - Get board details
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
    const userId = session.user.id;
    const divisionId = session.user.divisionId;

    const board = await prisma.board.findUnique({
      where: { id },
      include: {
        division: { select: { id: true, name: true } },
        boardAccess: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatar: true },
            },
          },
        },
        tasks: {
          include: {
            assignedTo: {
              select: { id: true, name: true, email: true, avatar: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!board) {
      return NextResponse.json({ error: "Board not found" }, { status: 404 });
    }

    // Check access
    const hasAccess =
      board.type === "general" ||
      (board.type === "division" && board.divisionId === divisionId) ||
      (board.type === "personal" &&
        board.boardAccess.some((access) => access.userId === userId));

    if (!hasAccess) {
      return NextResponse.json(
        { error: "Access denied to this board" },
        { status: 403 }
      );
    }

    return NextResponse.json(board);
  } catch (error) {
    console.error("Get board error:", error);
    return NextResponse.json(
      { error: "Failed to fetch board" },
      { status: 500 }
    );
  }
}

// PUT /api/boards/[id] - Update board
export async function PUT(
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
    const { name, description, userIds } = body;

    const board = await prisma.board.findUnique({
      where: { id },
      include: {
        boardAccess: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });

    if (!board) {
      return NextResponse.json({ error: "Board not found" }, { status: 404 });
    }

    // Only board owner (via boardAccess with canEdit) or admin/master can update
    const canEdit = board.boardAccess.some(
      (access) => access.userId === session.user.id && access.canEdit
    );
    if (!canEdit && !["admin", "master"].includes(session.user.role)) {
      return NextResponse.json(
        { error: "Only board owner or admin can update" },
        { status: 403 }
      );
    }

    // Update board
    const updatedBoard = await prisma.board.update({
      where: { id },
      data: {
        name: name || board.name,
        description:
          description !== undefined ? description : board.description,
      },
      include: {
        division: { select: { id: true, name: true } },
        boardAccess: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatar: true },
            },
          },
        },
      },
    });

    // Update access for personal boards
    if (board.type === "personal" && userIds) {
      // Remove old access
      await prisma.boardAccess.deleteMany({
        where: { boardId: id },
      });

      // Add new access
      await prisma.boardAccess.createMany({
        data: [
          { boardId: id, userId: session.user.id },
          ...userIds.map((userId: string) => ({ boardId: id, userId })),
        ],
      });
    }

    return NextResponse.json(updatedBoard);
  } catch (error) {
    console.error("Update board error:", error);
    return NextResponse.json(
      { error: "Failed to update board" },
      { status: 500 }
    );
  }
}

// DELETE /api/boards/[id] - Delete board
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

    const board = await prisma.board.findUnique({
      where: { id },
      include: {
        boardAccess: true,
      },
    });

    if (!board) {
      return NextResponse.json({ error: "Board not found" }, { status: 404 });
    }

    // Only board owner (via boardAccess with canEdit) or admin/master can delete
    const canEdit = board.boardAccess.some(
      (access) => access.userId === session.user.id && access.canEdit
    );
    if (!canEdit && !["admin", "master"].includes(session.user.role)) {
      return NextResponse.json(
        { error: "Only board owner or admin can delete" },
        { status: 403 }
      );
    }

    // Delete board (cascade will handle tasks and access)
    await prisma.board.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete board error:", error);
    return NextResponse.json(
      { error: "Failed to delete board" },
      { status: 500 }
    );
  }
}
