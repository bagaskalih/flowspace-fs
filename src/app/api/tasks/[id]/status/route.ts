import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PATCH /api/tasks/[id]/status - Update task status
export async function PATCH(
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
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }

    const validStatuses = ["todo", "in_progress", "review", "done", "closed"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const task = await prisma.task.findUnique({
      where: { id },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: { status },
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

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error("Update task status error:", error);
    return NextResponse.json(
      { error: "Failed to update task status" },
      { status: 500 }
    );
  }
}
