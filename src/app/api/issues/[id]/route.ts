import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/issues/[id] - Get issue details with comments
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

    const issue = await prisma.issue.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        assignedTo: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        comments: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatar: true },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!issue) {
      return NextResponse.json({ error: "Issue not found" }, { status: 404 });
    }

    return NextResponse.json(issue);
  } catch (error) {
    console.error("Get issue error:", error);
    return NextResponse.json(
      { error: "Failed to fetch issue" },
      { status: 500 }
    );
  }
}

// PUT /api/issues/[id] - Update issue
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
    const { title, description, status, priority, assignedToId } = body;

    const issue = await prisma.issue.findUnique({
      where: { id },
    });

    if (!issue) {
      return NextResponse.json({ error: "Issue not found" }, { status: 404 });
    }

    const updatedIssue = await prisma.issue.update({
      where: { id },
      data: {
        title: title !== undefined ? title : issue.title,
        description:
          description !== undefined ? description : issue.description,
        status: status !== undefined ? status : issue.status,
        priority: priority !== undefined ? priority : issue.priority,
        assignedToId:
          assignedToId !== undefined ? assignedToId : issue.assignedToId,
      },
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
    });

    return NextResponse.json(updatedIssue);
  } catch (error) {
    console.error("Update issue error:", error);
    return NextResponse.json(
      { error: "Failed to update issue" },
      { status: 500 }
    );
  }
}

// DELETE /api/issues/[id] - Delete issue
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

    const issue = await prisma.issue.findUnique({
      where: { id },
    });

    if (!issue) {
      return NextResponse.json({ error: "Issue not found" }, { status: 404 });
    }

    // Only creator or admin/master can delete
    if (
      issue.createdById !== session.user.id &&
      !["admin", "master"].includes(session.user.role)
    ) {
      return NextResponse.json(
        { error: "Only issue creator or admin can delete" },
        { status: 403 }
      );
    }

    await prisma.issue.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete issue error:", error);
    return NextResponse.json(
      { error: "Failed to delete issue" },
      { status: 500 }
    );
  }
}
