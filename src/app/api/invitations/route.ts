import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/middleware/auth";
import crypto from "crypto";

// GET all invitations (Admin/Master only)
export async function GET() {
  const authResult = await requireAdmin();
  if (authResult instanceof NextResponse) return authResult;

  try {
    const invitations = await prisma.invitation.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            status: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ invitations });
  } catch (error) {
    console.error("Error fetching invitations:", error);
    return NextResponse.json(
      { error: "Failed to fetch invitations" },
      { status: 500 }
    );
  }
}

// POST create new invitation (Admin/Master only)
export async function POST(req: Request) {
  const authResult = await requireAdmin();
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser && existingUser.status === "active") {
      return NextResponse.json(
        { error: "User already exists and is active" },
        { status: 400 }
      );
    }

    // Check if there's a pending invitation
    const existingInvitation = await prisma.invitation.findFirst({
      where: {
        email,
        status: "pending",
      },
    });

    if (existingInvitation) {
      return NextResponse.json(
        { error: "Invitation already sent to this email" },
        { status: 400 }
      );
    }

    // Generate unique token
    const token = crypto.randomBytes(32).toString("hex");

    // Create invitation
    const invitation = await prisma.invitation.create({
      data: {
        email,
        token,
        status: "pending",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        createdById: authResult.user.id,
        userId: existingUser?.id || null,
      },
      include: {
        createdBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    // If user exists with pending status, activate them
    if (existingUser && existingUser.status === "pending") {
      await prisma.user.update({
        where: { id: existingUser.id },
        data: { status: "active" },
      });
    }

    return NextResponse.json(
      {
        message: "Invitation created successfully",
        invitation,
        invitationLink: `${process.env.NEXTAUTH_URL}/invite/${token}`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating invitation:", error);
    return NextResponse.json(
      { error: "Failed to create invitation" },
      { status: 500 }
    );
  }
}
