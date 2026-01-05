import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/auth/users - List all users (admin/master only) or users by division
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const divisionId = searchParams.get("divisionId");

    // If divisionId is provided, return users from that division (or all if general)
    if (divisionId) {
      let users;
      if (divisionId === "general") {
        // For general, return all users
        users = await prisma.user.findMany({
          where: {
            status: "active",
          },
          include: {
            division: {
              select: { id: true, name: true },
            },
          },
          orderBy: { name: "asc" },
        });
      } else {
        // Return users from specific division
        users = await prisma.user.findMany({
          where: {
            divisionId: divisionId,
            status: "active",
          },
          include: {
            division: {
              select: { id: true, name: true },
            },
          },
          orderBy: { name: "asc" },
        });
      }

      const sanitizedUsers = users.map(({ password, ...user }) => user);
      return NextResponse.json(sanitizedUsers);
    }

    // Only admin and master can view all users without division filter
    if (!["admin", "master"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      include: {
        division: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const sanitizedUsers = users.map(({ password, ...user }) => user);

    return NextResponse.json(sanitizedUsers);
  } catch (error) {
    console.error("Get users error:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
