import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function requireAuth() {
  const session = await auth();

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return session;
}

export async function requireRole(allowedRoles: string[]) {
  const session = await auth();

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!allowedRoles.includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return session;
}

export async function requireAdmin() {
  return requireRole(["admin", "master"]);
}

export async function requireMaster() {
  return requireRole(["master"]);
}
